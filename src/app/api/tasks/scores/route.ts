import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { TasksService } from "@/services/tasks.domain";
import { TaskScoresQuerySchema } from "@/lib/validations/task.schema";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const query = TaskScoresQuerySchema.parse(Object.fromEntries(searchParams));
  const data = await TasksService.getScores(payload, query);
  return NextResponse.json({ success: true, data });
});
