import mongoose, { FilterQuery } from "mongoose";
import { forbidden, notFound, badRequest, conflict } from "@/lib/api-errors";
import { CHANNELS, EVENTS, triggerPusher } from "@/lib/pusher";
import type { TokenPayload } from "@/lib/jwt-auth";
import {
  Task,
  type ITask,
  type ITaskQuestion,
  type ITaskSubmission,
} from "@/models/Task";
import type {
  CreateTaskInput,
  SubmitTaskInput,
  TaskListQueryInput,
  TaskScoresQueryInput,
  UpdateTaskInput,
} from "@/lib/validations/task.schema";

type TaskActor = Pick<TokenPayload, "userId" | "role" | "branch">;
type TaskLean = {
  _id: string;
  title: string;
  description: string;
  category: string;
  branches: string[];
  questions: ITaskQuestion[];
  submissions: ITaskSubmission[];
  deadline?: Date;
  status: "active" | "closed";
  createdBy?: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type TaskWithCompletion = TaskLean & {
  mySubmission?: ITaskSubmission | null;
  completed?: boolean;
};

type ScoreSummary = {
  totalScore: number;
  totalQuestions: number;
  overallPercentage: number;
  completedTasks: number;
  knowledgeLevel: string;
  knowledgeLevelTh: string;
  levelColor: string;
  categoryScores: Record<string, { score: number; total: number; count: number }>;
  recentScores: Array<{
    title: string;
    category: string;
    score: number;
    total: number;
    percentage: number;
    submittedAt: string;
  }>;
};

class TaskRepository {
  async findMany(query: FilterQuery<ITask>) {
    const tasks = await Task.find(query)
      .populate("createdBy", "name surname")
      .populate("submissions.userId", "lineDisplayName lineProfileImage name surname performanceTier")
      .sort({ createdAt: -1 })
      .lean();

    return tasks.map(mapTask);
  }

  async findById(id: string) {
    const task = await Task.findById(id)
      .populate("createdBy", "name surname")
      .populate("submissions.userId", "lineDisplayName lineProfileImage name surname performanceTier")
      .lean();

    return task ? mapTask(task) : null;
  }

  async findByIdDocument(id: string) {
    return Task.findById(id);
  }

  async create(input: {
    title: string;
    description: string;
    category: string;
    branches: string[];
    questions: ITaskQuestion[];
    deadline?: Date;
    createdBy: mongoose.Types.ObjectId;
  }) {
    const task = await Task.create({
      ...input,
      status: "active",
    });

    return mapTask(task.toObject());
  }

  async deleteById(id: string) {
    const task = await Task.findByIdAndDelete(id).lean();
    return task ? mapTask(task) : null;
  }

  async findSubmittedForUser(userId: string) {
    const tasks = await Task.find({
      "submissions.userId": new mongoose.Types.ObjectId(userId),
    }).select("title category submissions").lean();

    return tasks.map(mapTask);
  }
}

const repository = new TaskRepository();

export class TasksService {
  static async list(actor: TaskActor, query: TaskListQueryInput) {
    const filter = buildTaskListFilter(actor, query);
    const tasks = await repository.findMany(filter);

    return tasks.map((task) => {
      if (!query.userId) {
        return task;
      }

      const submission = task.submissions.find((entry) => resolveSubmissionUserId(entry.userId) === query.userId);
      return {
        ...task,
        mySubmission: submission ?? null,
        completed: Boolean(submission),
      } satisfies TaskWithCompletion;
    });
  }

  static async getById(actor: TaskActor, id: string) {
    const task = await repository.findById(id);
    if (!task) {
      throw notFound("Task not found");
    }

    assertTaskAccess(actor, task);
    return task;
  }

  static async create(actor: TaskActor, input: CreateTaskInput) {
    assertManager(actor);

    const task = await repository.create({
      title: input.title,
      description: input.description,
      category: input.category,
      branches: input.branches,
      questions: input.questions,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      createdBy: new mongoose.Types.ObjectId(actor.userId),
    });

    await triggerPusher(CHANNELS.TASKS, EVENTS.NEW_TASK, {
      taskId: task._id,
      title: task.title,
      branches: task.branches,
    });

    return task;
  }

  static async submit(actor: TaskActor, id: string, input: SubmitTaskInput) {
    if (actor.role === "driver" && actor.userId !== input.userId) {
      throw forbidden("Drivers can only submit tasks for themselves");
    }

    const task = await repository.findByIdDocument(id);
    if (!task) {
      throw notFound("Task not found");
    }

    const taskData = mapTask(task.toObject());
    assertTaskAccess(actor, taskData);

    const alreadySubmitted = task.submissions.some((entry) => entry.userId.toString() === input.userId);
    if (alreadySubmitted) {
      throw conflict("Already submitted");
    }

    if (task.status !== "active") {
      throw badRequest("Task is closed");
    }

    let score = 0;
    const total = task.questions.length;
    task.questions.forEach((question, index) => {
      if (input.answers[index] === question.correctIndex) {
        score += 1;
      }
    });

    task.submissions.push({
      userId: new mongoose.Types.ObjectId(input.userId),
      answers: input.answers,
      score,
      total,
      submittedAt: new Date(),
    } as ITaskSubmission);

    await task.save();
    await task.populate("submissions.userId", "lineDisplayName lineProfileImage name surname performanceTier");

    await triggerPusher(CHANNELS.TASKS, EVENTS.TASK_SUBMITTED, {
      taskId: id,
      userId: input.userId,
      score,
      total,
    });

    return { task: mapTask(task.toObject()), score, total };
  }

  static async update(actor: TaskActor, id: string, input: UpdateTaskInput) {
    assertManager(actor);

    const task = await repository.findByIdDocument(id);
    if (!task) {
      throw notFound("Task not found");
    }

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.category !== undefined) task.category = input.category;
    if (input.branches !== undefined) task.branches = input.branches;
    if (input.questions !== undefined) task.questions = input.questions;
    if (input.deadline !== undefined) task.deadline = input.deadline ? new Date(input.deadline) : undefined;
    if (input.status !== undefined) task.status = input.status;

    await task.save();

    await triggerPusher(CHANNELS.TASKS, EVENTS.TASK_UPDATED, { taskId: id });
    return mapTask(task.toObject());
  }

  static async remove(actor: TaskActor, id: string) {
    assertManager(actor);

    const task = await repository.deleteById(id);
    if (!task) {
      throw notFound("Task not found");
    }

    await triggerPusher(CHANNELS.TASKS, EVENTS.TASK_DELETED, { taskId: id });
  }

  static async getScores(actor: TaskActor, query: TaskScoresQueryInput) {
    if (actor.role === "driver" && actor.userId !== query.userId) {
      throw forbidden("Drivers can only view their own scores");
    }

    const tasks = await repository.findSubmittedForUser(query.userId);

    let totalScore = 0;
    let totalQuestions = 0;
    let completedTasks = 0;
    const categoryScores: ScoreSummary["categoryScores"] = {};
    const recentScores: ScoreSummary["recentScores"] = [];

    for (const task of tasks) {
      const submission = task.submissions.find((entry) => resolveSubmissionUserId(entry.userId) === query.userId);
      if (!submission) {
        continue;
      }

      completedTasks += 1;
      totalScore += submission.score;
      totalQuestions += submission.total;

      const category = task.category || "ทั่วไป";
      if (!categoryScores[category]) {
        categoryScores[category] = { score: 0, total: 0, count: 0 };
      }

      categoryScores[category].score += submission.score;
      categoryScores[category].total += submission.total;
      categoryScores[category].count += 1;

      recentScores.push({
        title: task.title,
        category,
        score: submission.score,
        total: submission.total,
        percentage: submission.total > 0 ? Math.round((submission.score / submission.total) * 100) : 0,
        submittedAt: submission.submittedAt?.toISOString() ?? "",
      });
    }

    recentScores.sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime());

    const overallPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const level = getKnowledgeLevel(overallPercentage);

    return {
      totalScore,
      totalQuestions,
      overallPercentage,
      completedTasks,
      knowledgeLevel: level.knowledgeLevel,
      knowledgeLevelTh: level.knowledgeLevelTh,
      levelColor: level.levelColor,
      categoryScores,
      recentScores: recentScores.slice(0, 5),
    } satisfies ScoreSummary;
  }
}

function buildTaskListFilter(actor: TaskActor, query: TaskListQueryInput): FilterQuery<ITask> {
  const filter: FilterQuery<ITask> = {};
  if (query.status) {
    filter.status = query.status;
  }

  if (actor.role === "driver") {
    if (actor.branch) {
      filter.branches = actor.branch;
    }
    filter.status = "active";
    return filter;
  }

  if (query.branch) {
    filter.branches = query.branch;
  }

  return filter;
}

function assertTaskAccess(actor: TaskActor, task: TaskLean) {
  if (actor.role === "driver") {
    if (task.status !== "active") {
      throw forbidden("Forbidden");
    }

    if (task.branches.length > 0 && actor.branch && !task.branches.includes(actor.branch)) {
      throw forbidden("Forbidden");
    }
  }
}

function assertManager(actor: TaskActor) {
  if (actor.role !== "leader" && actor.role !== "admin") {
    throw forbidden("Forbidden");
  }
}

function resolveSubmissionUserId(userId: unknown) {
  if (userId && typeof userId === "object" && "_id" in userId) {
    return String((userId as { _id: unknown })._id);
  }

  return String(userId);
}

function mapTask(task: Record<string, unknown>): TaskLean {
  return {
    _id: String(task._id),
    title: String(task.title),
    description: String(task.description ?? ""),
    category: String(task.category),
    branches: Array.isArray(task.branches) ? task.branches.map(String) : [],
    questions: Array.isArray(task.questions) ? (task.questions as ITaskQuestion[]) : [],
    submissions: Array.isArray(task.submissions) ? (task.submissions as ITaskSubmission[]) : [],
    deadline: task.deadline ? new Date(task.deadline as Date) : undefined,
    status: task.status as "active" | "closed",
    createdBy: task.createdBy,
    createdAt: new Date(task.createdAt as Date),
    updatedAt: new Date(task.updatedAt as Date),
  };
}

function getKnowledgeLevel(overallPercentage: number) {
  if (overallPercentage >= 90) {
    return { knowledgeLevel: "Expert", knowledgeLevelTh: "ผู้เชี่ยวชาญ", levelColor: "#f59e0b" };
  }
  if (overallPercentage >= 75) {
    return { knowledgeLevel: "Advanced", knowledgeLevelTh: "ขั้นสูง", levelColor: "#8b5cf6" };
  }
  if (overallPercentage >= 60) {
    return { knowledgeLevel: "Intermediate", knowledgeLevelTh: "ปานกลาง", levelColor: "#3b82f6" };
  }
  if (overallPercentage >= 40) {
    return { knowledgeLevel: "Elementary", knowledgeLevelTh: "พื้นฐาน", levelColor: "#10b981" };
  }

  return { knowledgeLevel: "Beginner", knowledgeLevelTh: "เริ่มต้น", levelColor: "#94a3b8" };
}
