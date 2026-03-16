import { z } from "zod";

const objectIdString = z.string().trim().regex(/^[a-f\d]{24}$/i, "Expected ObjectId");
const leaderRoleSchema = z.enum(["leader", "admin"]);

export const CreateLeaderSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(100),
  branch: z.string().trim().min(1).max(100).nullable().optional(),
  role: leaderRoleSchema.optional(),
});

export const UpdateLeaderSchema = z.object({
  leaderId: objectIdString,
  email: z.string().trim().email().max(200).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  branch: z.string().trim().min(1).max(100).nullable().optional(),
  role: leaderRoleSchema.optional(),
  newPassword: z.string().min(8).max(200).optional(),
});

export type CreateLeaderInput = z.infer<typeof CreateLeaderSchema>;
export type UpdateLeaderInput = z.infer<typeof UpdateLeaderSchema>;
