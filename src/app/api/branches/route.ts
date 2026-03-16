import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { CreateBranchSchema, DeleteBranchSchema, UpdateBranchSchema } from "@/lib/validations/branch.schema";
import { BranchesService } from "@/services/branches.domain";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const branches = await BranchesService.list();
  return NextResponse.json({ success: true, branches });
}, { requireAuth: false });

export const POST = apiHandler(async ({ req }) => {
  const body = await req.json();
  const input = CreateBranchSchema.parse(body);
  await BranchesService.create(input);
  return NextResponse.json({ success: true });
}, { allowedRoles: ["admin"] });

export const PATCH = apiHandler(async ({ req }) => {
  const body = await req.json();
  const input = UpdateBranchSchema.parse(body);
  await BranchesService.update(input);
  return NextResponse.json({ success: true });
}, { allowedRoles: ["admin"] });

export const DELETE = apiHandler(async ({ req }) => {
  const { searchParams } = new URL(req.url);
  const input = DeleteBranchSchema.parse({ code: searchParams.get("code") ?? undefined });
  await BranchesService.remove(input);
  return NextResponse.json({ success: true });
}, { allowedRoles: ["admin"] });
