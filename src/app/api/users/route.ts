import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { DeleteUserSchema, UpdateUserSchema, UserListQuerySchema } from "@/lib/validations/user.schema";
import { UsersService } from "@/services/users.domain";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const query = UserListQuerySchema.parse(Object.fromEntries(searchParams));
  const users = await UsersService.list(payload, query);
  return NextResponse.json({ success: true, users });
});

export const PATCH = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const body = await req.json();
  const input = UpdateUserSchema.parse(body);
  const user = await UsersService.update(payload, input);
  return NextResponse.json({ success: true, user });
});

export const DELETE = apiHandler(async ({ req, payload }) => {
  if (!payload) {
    throw badRequest("Missing auth payload");
  }

  const { searchParams } = new URL(req.url);
  const input = DeleteUserSchema.parse({ id: searchParams.get("id") ?? undefined });
  await UsersService.remove(payload, input);
  return NextResponse.json({ success: true });
}, { allowedRoles: ["leader", "admin"] });
