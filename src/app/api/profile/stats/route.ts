import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { ProfileStatsQuerySchema } from "@/lib/validations/ops.schema";
import { ProfileStatsService } from "@/services/ops.domain";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const query = ProfileStatsQuerySchema.parse(Object.fromEntries(searchParams));
  const stats = await ProfileStatsService.get(query);
  return NextResponse.json({ success: true, stats });
});
