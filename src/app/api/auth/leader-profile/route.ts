import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { LeaderProfileUpdateSchema } from "@/lib/validations/auth.schema";
import { AuthService } from "@/services/auth.domain";

export const dynamic = "force-dynamic";

export const PATCH = apiHandler(async ({ req }) => {
  const body = await req.json();
  const input = LeaderProfileUpdateSchema.parse(body);
  const user = await AuthService.updateLeaderProfile(input);
  return NextResponse.json({ success: true, user });
});
