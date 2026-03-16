import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { CountsQuerySchema } from "@/lib/validations/branch.schema";
import { BranchesService } from "@/services/branches.domain";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const query = CountsQuerySchema.parse(Object.fromEntries(searchParams));
  const result = await BranchesService.getCounts(payload, query);
  return NextResponse.json({ success: true, ...result });
});
