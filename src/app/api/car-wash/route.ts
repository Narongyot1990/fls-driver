import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { CarWashService } from "@/services/car-wash.domain";
import { CarWashQuerySchema, CreateCarWashSchema } from "@/lib/validations/car-wash.schema";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const query = CarWashQuerySchema.parse(Object.fromEntries(searchParams));
  const result = await CarWashService.list(query);
  return NextResponse.json({ success: true, ...result });
});

export const POST = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const formData = await req.formData();
  const images = formData.getAll("images").filter((entry): entry is File => entry instanceof File);
  const input = CreateCarWashSchema.parse({
    userId: formData.get("userId"),
    activityType: formData.get("activityType") ?? undefined,
    caption: formData.get("caption") ?? undefined,
    activityDate: formData.get("activityDate"),
    activityTime: formData.get("activityTime"),
  });

  const activity = await CarWashService.create(input, images);
  return NextResponse.json({ success: true, activity });
});
