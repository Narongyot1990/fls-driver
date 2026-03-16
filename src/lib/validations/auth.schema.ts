import { z } from "zod";

export const LineLoginSchema = z.object({
  code: z.string().trim().min(1),
  redirectUri: z.string().url().optional(),
});

export const LeaderLoginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export const LeaderProfileUpdateSchema = z.object({
  leaderId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(100).optional(),
  surname: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().min(1).max(50).optional(),
  employeeId: z.string().trim().min(1).max(50).optional(),
  branch: z.string().trim().min(1).max(100).optional(),
  role: z.enum(["leader", "admin"]).optional(),
  currentPassword: z.string().min(1).max(200).optional(),
  newPassword: z.string().min(8).max(200).optional(),
});

export type LineLoginInput = z.infer<typeof LineLoginSchema>;
export type LeaderLoginInput = z.infer<typeof LeaderLoginSchema>;
export type LeaderProfileUpdateInput = z.infer<typeof LeaderProfileUpdateSchema>;
