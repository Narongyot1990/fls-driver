import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { LeaveService } from "@/services/leave.domain";
import { CancelLeaveSchema, ReviewLeaveSchema } from "@/lib/validations/leave.schema";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return apiHandler(async ({ req, payload }) => {
    if (!payload) {
      throw badRequest("Missing auth payload");
    }

    const { searchParams } = new URL(req.url);
    const input = CancelLeaveSchema.parse({ userId: searchParams.get("userId") ?? undefined });
    const result = await LeaveService.cancel(payload, id, input);
    return NextResponse.json(result);
  })(request);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return apiHandler(async ({ req, payload }) => {
    if (!payload) {
      throw badRequest("Missing auth payload");
    }

    const body = await req.json();
    const input = ReviewLeaveSchema.parse(body);
    const result = await LeaveService.review(payload, id, input);
    return NextResponse.json({ success: true, request: result });
  })(request);
}
