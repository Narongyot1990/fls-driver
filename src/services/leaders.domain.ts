import bcrypt from "bcryptjs";
import { conflict, notFound } from "@/lib/api-errors";
import { Leader } from "@/models/Leader";
import type { CreateLeaderInput, UpdateLeaderInput } from "@/lib/validations/leader.schema";

export class LeadersService {
  static async list() {
    return Leader.find().select("email name branch role createdAt").sort({ createdAt: -1 }).lean();
  }

  static async create(input: CreateLeaderInput) {
    const existing = await Leader.findOne({ email: input.email }).lean();
    if (existing) {
      throw conflict("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const leader = await Leader.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      branch: input.branch ?? null,
      role: input.role ?? "leader",
    });

    return toLeaderResponse(leader.toObject());
  }

  static async update(input: UpdateLeaderInput) {
    const leader = await Leader.findById(input.leaderId);
    if (!leader) {
      throw notFound("Leader not found");
    }

    if (input.email !== undefined) leader.email = input.email;
    if (input.name !== undefined) leader.name = input.name;
    if (input.branch !== undefined) leader.branch = input.branch ?? undefined;
    if (input.role !== undefined) leader.role = input.role;
    if (input.newPassword) leader.password = await bcrypt.hash(input.newPassword, 10);

    await leader.save();
    return toLeaderResponse(leader.toObject());
  }
}

function toLeaderResponse(leader: Record<string, unknown>) {
  return {
    id: leader._id,
    email: leader.email,
    name: leader.name,
    branch: leader.branch,
    role: leader.role,
  };
}
