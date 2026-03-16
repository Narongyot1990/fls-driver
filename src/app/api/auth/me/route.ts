import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { AuthService } from "@/services/auth.domain";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const user = await AuthService.getCurrentSession();
  return NextResponse.json({ success: true, user });
}, { requireAuth: false });
