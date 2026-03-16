import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { AttendanceService } from "@/services/attendance.domain";
import {
  AttendanceCorrectionCreateSchema,
  AttendanceCorrectionQuerySchema,
  AttendanceCorrectionReviewSchema,
} from "@/lib/validations/attendance.schema";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const query = AttendanceCorrectionQuerySchema.parse(Object.fromEntries(searchParams));
  const corrections = await AttendanceService.listCorrections(payload, query);
  return NextResponse.json({ success: true, corrections });
});

export const POST = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const body = await req.json();
  const input = AttendanceCorrectionCreateSchema.parse(body);
  const correction = await AttendanceService.createCorrection(payload, input);
  return NextResponse.json({ success: true, correction });
});

export const PATCH = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const body = await req.json();
  const input = AttendanceCorrectionReviewSchema.parse(body);
  const correction = await AttendanceService.reviewCorrection(payload, input);
  return NextResponse.json({ success: true, correction });
});
