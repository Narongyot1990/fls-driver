import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { AuthService } from "@/services/auth.domain";
import { LeaderLoginSchema } from "@/lib/validations/auth.schema";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async ({ req }) => {
  const body = await req.json();
  const input = LeaderLoginSchema.parse(body);
  const result = await AuthService.loginLeader(input);

  const response = NextResponse.json({ success: true, leader: result.user });
  AuthService.attachSessionCookies(response, result.payload);
  return response;
}, { requireAuth: false });
