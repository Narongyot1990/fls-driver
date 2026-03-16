import { z } from "zod";

const isoDateString = z.string().datetime({ offset: true }).or(z.string().datetime({ local: true }));
const calendarDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const AttendanceTypeSchema = z.enum(["in", "out"]);
export const AttendanceRangeSchema = z.enum(["day", "week", "month"]);
export const AttendanceCorrectionStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const AttendanceCorrectionCategorySchema = z.enum(["correction", "offsite"]);

export const ClockInSchema = z.object({
  type: AttendanceTypeSchema,
  location: CoordinatesSchema,
  branchCode: z.string().trim().min(1).max(100),
  branchLocation: CoordinatesSchema.optional(),
  radius: z.number().positive().max(5000).optional(),
});

export const AttendanceQuerySchema = z.object({
  userId: z.string().trim().min(1).optional(),
  branch: z.string().trim().min(1).max(100).optional(),
  date: calendarDateString.optional(),
  range: AttendanceRangeSchema.optional().default("day"),
  startDate: calendarDateString.optional(),
  endDate: calendarDateString.optional(),
  userName: z.string().trim().min(1).max(100).optional(),
});

export const PatchAttendanceSchema = z.object({
  id: z.string().trim().min(1),
  timestamp: isoDateString.optional(),
  type: AttendanceTypeSchema.optional(),
  branch: z.string().trim().min(1).max(100).optional(),
});

export const AttendanceCorrectionQuerySchema = z.object({
  status: AttendanceCorrectionStatusSchema.optional(),
});

export const AttendanceCorrectionCreateSchema = z.object({
  type: AttendanceTypeSchema,
  requestedTime: isoDateString,
  reason: z.string().trim().min(3).max(1000),
  location: CoordinatesSchema,
  distance: z.number().min(0).max(500000).optional().default(0),
  branch: z.string().trim().min(1).max(100),
  category: AttendanceCorrectionCategorySchema.optional().default("correction"),
  offsiteLocation: z.string().trim().min(3).max(200).optional(),
}).superRefine((data, ctx) => {
  if (data.category === "offsite" && !data.offsiteLocation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["offsiteLocation"],
      message: "Offsite location is required for offsite requests",
    });
  }
});

export const AttendanceCorrectionReviewSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["approved", "rejected"]),
  rejectedReason: z.string().trim().min(3).max(500).optional(),
}).superRefine((data, ctx) => {
  if (data.status === "rejected" && !data.rejectedReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["rejectedReason"],
      message: "Rejected reason is required when rejecting a request",
    });
  }
});

export type ClockInInput = z.infer<typeof ClockInSchema>;
export type AttendanceQueryInput = z.infer<typeof AttendanceQuerySchema>;
export type PatchAttendanceInput = z.infer<typeof PatchAttendanceSchema>;
export type AttendanceCorrectionQueryInput = z.infer<typeof AttendanceCorrectionQuerySchema>;
export type AttendanceCorrectionCreateInput = z.infer<typeof AttendanceCorrectionCreateSchema>;
export type AttendanceCorrectionReviewInput = z.infer<typeof AttendanceCorrectionReviewSchema>;
