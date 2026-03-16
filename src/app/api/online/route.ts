import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/jwt-auth";
import dbConnect from "@/lib/mongodb";
import { OnlineService } from "@/services/ops.domain";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const payload = await getCurrentUser();
    await dbConnect();
    await OnlineService.heartbeat(payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  try {
    const payload = await getCurrentUser();
    await dbConnect();
    await OnlineService.disconnect(payload);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
