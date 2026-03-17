import mongoose, { type QueryFilter } from "mongoose";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { badRequest } from "@/lib/api-errors";
import type { TokenPayload } from "@/lib/jwt-auth";
import { CarWashActivity } from "@/models/CarWashActivity";
import { SubstituteRecord } from "@/models/SubstituteRecord";
import type { ISubstituteRecord } from "@/models/SubstituteRecord";
import { User } from "@/models/User";
import { WorkSchedule } from "@/models/WorkSchedule";
import type {
  CreateSubstituteInput,
  ProfileStatsQueryInput,
  SubstituteListQueryInput,
  UpsertWorkScheduleInput,
  WorkScheduleQueryInput,
} from "@/lib/validations/ops.schema";

dayjs.extend(isoWeek);

const ADMIN_ROOT_PROFILE = {
  _id: "admin_root",
  name: "ITL Administrator",
  role: "admin",
};

type OpsActor = Pick<TokenPayload, "userId" | "role">;

export class SubstituteService {
  static async list(query: SubstituteListQueryInput) {
    const filter: QueryFilter<ISubstituteRecord> = {};
    if (query.userId) {
      if (mongoose.Types.ObjectId.isValid(query.userId)) {
        filter.userId = query.userId;
      } else {
        return [];
      }
    }

    const records = await SubstituteRecord.find(filter)
      .populate("userId", "lineDisplayName employeeId phone name surname lineProfileImage")
      .populate("createdBy", "name")
      .sort({ date: -1 })
      .lean();

    return records.map((record) => {
      const normalized: Record<string, unknown> = { ...(record as unknown as Record<string, unknown>) };
      if (normalized.createdBy === "admin_root") {
        normalized.createdBy = ADMIN_ROOT_PROFILE;
      }
      return normalized;
    });
  }

  static async create(input: CreateSubstituteInput) {
    const record = await SubstituteRecord.create({
      userId: toMixedId(input.userId),
      recordType: input.recordType,
      date: parseLocalDate(input.date),
      description: input.description,
      createdBy: toMixedId(input.createdBy),
    });

    return record.toObject();
  }
}

export class WorkScheduleService {
  static async list(query: WorkScheduleQueryInput) {
    const filter: { userId?: string } = {};
    if (query.userId) filter.userId = query.userId;

    const schedules = await WorkSchedule.find(filter).lean();
    if (!query.month) {
      return schedules;
    }

    return schedules.map((schedule) => ({
      userId: schedule.userId,
      entries: schedule.entries.filter((entry) => entry.date.startsWith(query.month!)),
    }));
  }

  static async upsert(actor: OpsActor, input: UpsertWorkScheduleInput) {
    if (actor.role !== "admin" && actor.role !== "leader") {
      throw badRequest("Forbidden");
    }

    return WorkSchedule.findOneAndUpdate(
      { userId: input.userId },
      { userId: input.userId, entries: input.entries, updatedBy: actor.userId },
      { upsert: true, new: true },
    ).lean();
  }
}

export class OnlineService {
  static async heartbeat(payload: TokenPayload | null) {
    if (!payload) {
      throw badRequest("Unauthorized");
    }
    if (payload.userId === "admin_root") {
      return;
    }

    await User.findByIdAndUpdate(payload.userId, {
      lastSeen: new Date(),
      isOnline: true,
    });
  }

  static async disconnect(payload: TokenPayload | null) {
    if (!payload || payload.userId === "admin_root") {
      return;
    }

    await User.findByIdAndUpdate(payload.userId, {
      isOnline: false,
    });
  }
}

export class ProfileStatsService {
  static async get(query: ProfileStatsQueryInput) {
    const now = dayjs();
    const startOfMonth = now.startOf("month").toDate();
    const startOfWeek = now.startOf("isoWeek").toDate();
    const today = now.startOf("day").toDate();

    const [totalActivities, monthActivities, weekActivities, todayActivities, activityTypes] =
      await Promise.all([
        CarWashActivity.countDocuments({ userId: query.userId }),
        CarWashActivity.countDocuments({ userId: query.userId, activityDate: { $gte: startOfMonth } }),
        CarWashActivity.countDocuments({ userId: query.userId, activityDate: { $gte: startOfWeek } }),
        CarWashActivity.countDocuments({ userId: query.userId, activityDate: { $gte: today } }),
        CarWashActivity.aggregate([
          { $match: { userId: toMixedId(query.userId) } },
          { $group: { _id: "$activityType", count: { $sum: 1 } } },
        ]),
      ]);

    const byType = activityTypes.reduce<Record<string, number>>((accumulator, current) => {
      accumulator[String(current._id)] = Number(current.count);
      return accumulator;
    }, {});

    return {
      total: totalActivities,
      thisMonth: monthActivities,
      thisWeek: weekActivities,
      today: todayActivities,
      byType,
    };
  }
}

function toMixedId(value: string) {
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : value;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}
