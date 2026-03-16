import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-utils";
import { BranchesService } from "@/services/branches.domain";

export const POST = apiHandler(async () => {
  const branches = await BranchesService.syncDefaults();
  return NextResponse.json({ success: true, message: "Branches synced successfully", branches });
}, { allowedRoles: ["admin"] });
