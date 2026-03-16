import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { badRequest } from "@/lib/api-errors";
import { UserByIdSchema } from "@/lib/validations/user.schema";
import { UsersService } from "@/services/users.domain";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rawParams = await params;

  return apiHandler(async ({ payload }) => {
    if (!payload) {
      throw badRequest("Missing auth payload");
    }

    const input = UserByIdSchema.parse(rawParams);
    const user = await UsersService.getById(payload, input);
    return NextResponse.json({ success: true, user });
  })(request);
}
