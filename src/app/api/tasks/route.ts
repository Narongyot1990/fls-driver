import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { TasksService } from "@/services/tasks.domain";
import { CreateTaskSchema, TaskListQuerySchema } from "@/lib/validations/task.schema";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const query = TaskListQuerySchema.parse(Object.fromEntries(searchParams));
  const tasks = await TasksService.list(payload, query);
  return NextResponse.json({ success: true, tasks });
});

export const POST = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const body = await req.json();
  const input = CreateTaskSchema.parse(body);
  const task = await TasksService.create(payload, input);
  return NextResponse.json({ success: true, task });
}, { allowedRoles: ["leader", "admin"] });
