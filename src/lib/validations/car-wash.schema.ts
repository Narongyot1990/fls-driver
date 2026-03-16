import { z } from "zod";

const objectIdOrLiteral = z.string().trim().min(1);
const calendarDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const timeString = z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:mm");

export const CarWashQuerySchema = z.object({
  userId: objectIdOrLiteral.optional(),
  startDate: calendarDateString.optional(),
  endDate: calendarDateString.optional(),
  activityType: z.string().trim().min(1).max(50).optional(),
  marked: z.enum(["true", "false"]).optional(),
  countOnly: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const CreateCarWashSchema = z.object({
  userId: objectIdOrLiteral,
  activityType: z.string().trim().min(1).max(50).default("car-wash"),
  caption: z.string().trim().max(2000).default(""),
  activityDate: calendarDateString,
  activityTime: timeString,
});

export const LikeActivitySchema = z.object({
  action: z.literal("like"),
  visitorId: objectIdOrLiteral,
});

export const CommentActivitySchema = z.object({
  action: z.literal("comment"),
  visitorId: objectIdOrLiteral,
  text: z.string().trim().min(1).max(1000),
});

export const DeleteCommentSchema = z.object({
  action: z.literal("deleteComment"),
  visitorId: objectIdOrLiteral,
  commentId: objectIdOrLiteral,
});

export const MarkActivitySchema = z.object({
  action: z.literal("mark"),
  leaderId: objectIdOrLiteral,
});

export const EditActivitySchema = z.object({
  visitorId: objectIdOrLiteral,
  caption: z.string().trim().max(2000).optional(),
  activityDate: calendarDateString.optional(),
  activityTime: timeString.optional(),
});

export const CarWashPatchSchema = z.union([
  LikeActivitySchema,
  CommentActivitySchema,
  DeleteCommentSchema,
  MarkActivitySchema,
  EditActivitySchema,
]);

export const DeleteActivitySchema = z.object({
  visitorId: objectIdOrLiteral,
});

export type CarWashQueryInput = z.infer<typeof CarWashQuerySchema>;
export type CreateCarWashInput = z.infer<typeof CreateCarWashSchema>;
export type LikeActivityInput = z.infer<typeof LikeActivitySchema>;
export type CommentActivityInput = z.infer<typeof CommentActivitySchema>;
export type DeleteCommentInput = z.infer<typeof DeleteCommentSchema>;
export type MarkActivityInput = z.infer<typeof MarkActivitySchema>;
export type EditActivityInput = z.infer<typeof EditActivitySchema>;
export type CarWashPatchInput = z.infer<typeof CarWashPatchSchema>;
export type DeleteActivityInput = z.infer<typeof DeleteActivitySchema>;
