import { z } from "zod";

const BranchLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const BranchSchema = z.object({
  code: z.string().trim().min(2).max(10),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  location: BranchLocationSchema.nullable().optional(),
  radius: z.number().int().min(1).max(5000).optional(),
  active: z.boolean().optional(),
});

export const CreateBranchSchema = BranchSchema;

export const UpdateBranchSchema = BranchSchema.partial().extend({
  code: z.string().trim().min(2).max(10),
});

export const DeleteBranchSchema = z.object({
  code: z.string().trim().min(2).max(10),
});

export const CountsQuerySchema = z.object({
  type: z.enum(["all", "pending_leaves", "pending_drivers"]).optional().default("all"),
  branch: z.string().trim().min(1).max(100).optional(),
});

export type CreateBranchInput = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchInput = z.infer<typeof UpdateBranchSchema>;
export type DeleteBranchInput = z.infer<typeof DeleteBranchSchema>;
export type CountsQueryInput = z.infer<typeof CountsQuerySchema>;
