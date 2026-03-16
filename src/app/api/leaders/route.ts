import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { CreateLeaderSchema, UpdateLeaderSchema } from "@/lib/validations/leader.schema";
import { LeadersService } from "@/services/leaders.domain";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const leaders = await LeadersService.list();
  return NextResponse.json({ success: true, leaders });
}, { allowedRoles: ["admin"] });

export const POST = apiHandler(async ({ req }) => {
  const body = await req.json();
  const input = CreateLeaderSchema.parse(body);
  const leader = await LeadersService.create(input);
  return NextResponse.json({ success: true, leader });
}, { allowedRoles: ["admin"] });

export const PATCH = apiHandler(async ({ req }) => {
  const body = await req.json();
  const input = UpdateLeaderSchema.parse(body);
  const leader = await LeadersService.update(input);
  return NextResponse.json({ success: true, leader });
}, { allowedRoles: ["admin"] });
