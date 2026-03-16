import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { CreateSubstituteSchema, SubstituteListQuerySchema } from "@/lib/validations/ops.schema";
import { SubstituteService } from "@/services/ops.domain";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const query = SubstituteListQuerySchema.parse(Object.fromEntries(searchParams));
  const records = await SubstituteService.list(query);
  return NextResponse.json({ success: true, records });
});

export const POST = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const body = await req.json();
  const input = CreateSubstituteSchema.parse(body);
  const record = await SubstituteService.create(input);
  return NextResponse.json({ success: true, record });
}, { allowedRoles: ["leader", "admin"] });
