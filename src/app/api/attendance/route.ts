import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { AttendanceService } from "@/services/attendance.domain";
import {
  AttendanceQuerySchema,
  ClockInSchema,
  PatchAttendanceSchema,
} from "@/lib/validations/attendance.schema";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const params = AttendanceQuerySchema.parse(Object.fromEntries(searchParams));
  const records = await AttendanceService.listAttendance(payload, params);
  return NextResponse.json({ success: true, records });
});

export const POST = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const body = await req.json();
  const input = ClockInSchema.parse(body);
  const record = await AttendanceService.clockAction(payload.userId, input);
  return NextResponse.json({ success: true, record });
});

export const DELETE = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    throw badRequest("ID is required");
  }

  await AttendanceService.deleteRecord(id, payload);
  return NextResponse.json({ success: true });
});

export const PATCH = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const body = await req.json();
  const input = PatchAttendanceSchema.parse(body);
  const record = await AttendanceService.updateRecord(payload, input);
  return NextResponse.json({ success: true, record });
});
