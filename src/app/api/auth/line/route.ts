import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { AuthService } from "@/services/auth.domain";
import { LineLoginSchema } from "@/lib/validations/auth.schema";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async ({ req }) => {
  const body = await req.json();
  const input = LineLoginSchema.parse(body);
  const result = await AuthService.loginWithLine(input);

  const response = NextResponse.json({ success: true, user: result.user });
  AuthService.attachSessionCookies(response, result.payload);
  return response;
}, { requireAuth: false });
