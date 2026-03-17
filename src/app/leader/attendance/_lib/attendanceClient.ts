import { z } from "zod";

const authUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  surname: z.string().optional(),
  lineDisplayName: z.string().optional(),
  lineProfileImage: z.string().optional(),
  branch: z.string().optional(),
  role: z.enum(["driver", "leader", "admin"]).optional(),
});

const authMeResponseSchema = z.object({
  success: z.literal(true),
  user: authUserSchema,
});

const attendanceEventSchema = z.object({
  _id: z.string(),
  type: z.enum(["in", "out"]),
  timestamp: z.union([z.string(), z.date()]),
  branch: z.string().optional(),
  eventType: z.enum(["actual", "correction"]).optional().default("actual"),
});

const attendanceListResponseSchema = z.object({
  success: z.literal(true),
  records: z.array(attendanceEventSchema),
});

const workScheduleResponseSchema = z.object({
  success: z.literal(true),
  schedules: z.array(
    z.object({
      entries: z.array(z.unknown()).optional(),
    }),
  ),
});

const actionResponseSchema = z.object({
  success: z.literal(true),
});

const correctionResponseSchema = z.object({
  success: z.literal(true),
  correction: z.unknown().optional(),
});

const errorResponseSchema = z.object({
  success: z.literal(false).optional(),
  error: z.string().optional(),
});

export type AttendanceUser = z.infer<typeof authUserSchema>;
export type Coordinates = {
  lat: number;
  lon: number;
};
export type AttendanceEvent = z.infer<typeof attendanceEventSchema>;

export type ClockActionPayload = {
  type: "in" | "out";
  location: Coordinates | null;
  branchCode: string;
  branchLocation?: Coordinates;
  radius?: number;
};

export type AttendanceCorrectionPayload = {
  type: "in" | "out";
  category: "correction" | "offsite";
  requestedTime: Date;
  reason: string;
  offsiteLocation?: string;
  location: Coordinates | null;
  distance: number | null;
  branch: string;
};

export class AttendanceClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttendanceClientError";
  }
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const json = await response.json();
  if (!response.ok) {
    const parsed = errorResponseSchema.safeParse(json);
    throw new AttendanceClientError(parsed.success ? parsed.data.error ?? "Request failed" : "Request failed");
  }
  return json;
}

export async function getSessionUser(): Promise<AttendanceUser> {
  const json = await fetchJson("/api/auth/me");
  const parsed = authMeResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new AttendanceClientError("Unable to load current session");
  }
  return parsed.data.user;
}

export async function listAttendanceRecords(userId: string, startDate: string, endDate: string): Promise<AttendanceEvent[]> {
  const json = await fetchJson(`/api/attendance?startDate=${startDate}&endDate=${endDate}&userId=${encodeURIComponent(userId)}`);
  const parsed = attendanceListResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new AttendanceClientError("Unable to load attendance records");
  }
  return parsed.data.records;
}

export async function listWorkScheduleEntries(userId: string, month: string): Promise<unknown[]> {
  const json = await fetchJson(`/api/work-schedule?userId=${encodeURIComponent(userId)}&month=${month}`);
  const parsed = workScheduleResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new AttendanceClientError("Unable to load work schedule");
  }
  return parsed.data.schedules[0]?.entries ?? [];
}

export async function submitClockAction(payload: ClockActionPayload): Promise<void> {
  const json = await fetchJson("/api/attendance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const parsed = actionResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new AttendanceClientError("Unable to submit clock action");
  }
}

export async function deleteAttendanceRecord(recordId: string): Promise<void> {
  const json = await fetchJson(`/api/attendance?id=${encodeURIComponent(recordId)}`, {
    method: "DELETE",
  });
  const parsed = actionResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new AttendanceClientError("Unable to delete attendance record");
  }
}

export async function submitAttendanceCorrection(payload: AttendanceCorrectionPayload): Promise<void> {
  const json = await fetchJson("/api/attendance/correction", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const parsed = correctionResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new AttendanceClientError("Unable to submit correction");
  }
}
