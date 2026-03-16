import { z } from "zod";
import { TASK_BRANCH_CODES, TASK_STATUSES } from "@/models/Task";

const objectIdString = z.string().trim().regex(/^[a-f\d]{24}$/i, "Expected ObjectId");
const taskStatusSchema = z.enum(TASK_STATUSES);
const taskBranchSchema = z.enum(TASK_BRANCH_CODES);

export const TaskQuestionSchema = z.object({
  question: z.string().trim().min(5).max(500),
  options: z.array(z.string().trim().min(1).max(300)).min(2),
  correctIndex: z.number().int().min(0),
  hint: z.string().trim().max(500).optional().or(z.literal("")),
}).superRefine((question, ctx) => {
  if (question.correctIndex >= question.options.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["correctIndex"],
      message: "correctIndex must reference an existing option",
    });
  }
});

export const TaskListQuerySchema = z.object({
  status: taskStatusSchema.optional().default("active"),
  branch: z.string().trim().min(1).max(10).optional(),
  userId: z.string().trim().min(1).optional(),
});

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional().default(""),
  category: z.string().trim().min(2).max(100),
  branches: z.array(taskBranchSchema).optional().default([]),
  questions: z.array(TaskQuestionSchema).min(1),
  deadline: z.string().datetime({ offset: true }).optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().min(2).max(100).optional(),
  branches: z.array(taskBranchSchema).optional(),
  questions: z.array(TaskQuestionSchema).min(1).optional(),
  deadline: z.string().datetime({ offset: true }).nullable().optional(),
  status: taskStatusSchema.optional(),
});

export const SubmitTaskSchema = z.object({
  action: z.literal("submit"),
  userId: objectIdString,
  answers: z.array(z.number().int().min(-1)),
});

export const TaskPatchSchema = z.discriminatedUnion("action", [
  SubmitTaskSchema,
  z.object({
    action: z.literal("update"),
    data: UpdateTaskSchema,
  }),
]);

export const TaskScoresQuerySchema = z.object({
  userId: objectIdString,
});

export type TaskListQueryInput = z.infer<typeof TaskListQuerySchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type SubmitTaskInput = z.infer<typeof SubmitTaskSchema>;
export type TaskPatchInput = z.infer<typeof TaskPatchSchema>;
export type TaskScoresQueryInput = z.infer<typeof TaskScoresQuerySchema>;
