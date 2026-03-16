import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { CarWashService } from "@/services/car-wash.domain";
import { CarWashPatchSchema, DeleteActivitySchema } from "@/lib/validations/car-wash.schema";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return apiHandler(async () => {
    const activity = await CarWashService.getById(id);
    return NextResponse.json({ success: true, activity });
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
    const input = CarWashPatchSchema.parse(body);

    if ("action" in input) {
      if (input.action === "like") {
        const activity = await CarWashService.toggleLike(id, input);
        return NextResponse.json({ success: true, activity });
      }
      if (input.action === "comment") {
        const activity = await CarWashService.addComment(id, input);
        return NextResponse.json({ success: true, activity });
      }
      if (input.action === "deleteComment") {
        const activity = await CarWashService.deleteComment(payload, id, input);
        return NextResponse.json({ success: true, activity });
      }
      if (input.action === "mark") {
        const activity = await CarWashService.toggleMark(payload, id, input);
        return NextResponse.json({ success: true, activity });
      }
    }

    const activity = await CarWashService.edit(payload, id, input);
    return NextResponse.json({ success: true, activity });
  })(request);
}

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
    const input = DeleteActivitySchema.parse({ visitorId: searchParams.get("visitorId") ?? undefined });
    await CarWashService.remove(payload, id, input);
    return NextResponse.json({ success: true });
  })(request);
}
