import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { TasksService } from "@/services/tasks.domain";
import { TaskPatchSchema } from "@/lib/validations/task.schema";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return apiHandler(async ({ payload }) => {
    if (!payload) {
      throw badRequest("Missing auth payload");
    }

    const task = await TasksService.getById(payload, id);
    return NextResponse.json({ success: true, task });
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
    const input = TaskPatchSchema.parse(body);

    if (input.action === "submit") {
      const result = await TasksService.submit(payload, id, input);
      return NextResponse.json({ success: true, ...result });
    }

    const task = await TasksService.update(payload, id, input.data);
    return NextResponse.json({ success: true, task });
  })(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return apiHandler(async ({ payload }) => {
    if (!payload) {
      throw badRequest("Missing auth payload");
    }

    await TasksService.remove(payload, id);
    return NextResponse.json({ success: true });
  }, { allowedRoles: ["leader", "admin"] })(request);
}
