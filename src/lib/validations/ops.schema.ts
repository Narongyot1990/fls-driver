import { z } from "zod";

const objectIdOrLiteral = z.string().trim().min(1);
const calendarDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const monthString = z.string().regex(/^\d{4}-\d{2}$/, "Expected YYYY-MM");

export const RecordTypeSchema = z.enum([
  "vacation",
  "sick",
  "personal",
  "unpaid",
  "absent",
  "late",
  "accident",
  "damage",
]);

export const SubstituteListQuerySchema = z.object({
  userId: objectIdOrLiteral.optional(),
});

export const CreateSubstituteSchema = z.object({
  userId: objectIdOrLiteral,
  recordType: RecordTypeSchema,
  date: calendarDateString,
  description: z.string().trim().max(1000).optional(),
  createdBy: objectIdOrLiteral,
});

export const WorkScheduleEntrySchema = z.object({
  date: calendarDateString,
  shiftTemplateId: z.string().trim().min(1).max(100),
  shiftName: z.string().trim().min(1).max(100),
  startHour: z.number().int().min(0).max(23),
  startMinute: z.number().int().min(0).max(59),
  endHour: z.number().int().min(0).max(23),
  endMinute: z.number().int().min(0).max(59),
  color: z.string().trim().min(1).max(50),
});

export const WorkScheduleQuerySchema = z.object({
  userId: objectIdOrLiteral.optional(),
  month: monthString.optional(),
});

export const UpsertWorkScheduleSchema = z.object({
  userId: objectIdOrLiteral,
  entries: z.array(WorkScheduleEntrySchema),
});

export const ProfileStatsQuerySchema = z.object({
  userId: objectIdOrLiteral,
});

export type SubstituteListQueryInput = z.infer<typeof SubstituteListQuerySchema>;
export type CreateSubstituteInput = z.infer<typeof CreateSubstituteSchema>;
export type WorkScheduleQueryInput = z.infer<typeof WorkScheduleQuerySchema>;
export type UpsertWorkScheduleInput = z.infer<typeof UpsertWorkScheduleSchema>;
export type ProfileStatsQueryInput = z.infer<typeof ProfileStatsQuerySchema>;
