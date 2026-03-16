import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { AuthService } from "@/services/auth.domain";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async () => {
  await AuthService.logout();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}, { requireAuth: false });
