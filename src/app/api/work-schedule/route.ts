import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { UpsertWorkScheduleSchema, WorkScheduleQuerySchema } from "@/lib/validations/ops.schema";
import { WorkScheduleService } from "@/services/ops.domain";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const query = WorkScheduleQuerySchema.parse(Object.fromEntries(searchParams));
  const schedules = await WorkScheduleService.list(query);
  return NextResponse.json({ success: true, schedules });
});

export const POST = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const body = await req.json();
  const input = UpsertWorkScheduleSchema.parse(body);
  const schedule = await WorkScheduleService.upsert(payload, input);
  return NextResponse.json({ success: true, schedule });
}, { allowedRoles: ["leader", "admin"] });
