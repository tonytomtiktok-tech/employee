import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { memoryRepository } from "@/lib/repository/memory";
import { jsonError } from "@/lib/api/errors";

export async function GET(request: Request) {
  try {
    const actor = await requireActor();
    const url = new URL(request.url);
    const cycleId =
      url.searchParams.get("cycleId") ??
      memoryRepository.getCurrentCycle()?.cycleId;
    if (!cycleId) {
      return NextResponse.json({ error: "no cycle" }, { status: 404 });
    }
    const scope = url.searchParams.get("scope") ?? undefined;
    return NextResponse.json(getDashboardSummary(actor, cycleId, scope));
  } catch (e) {
    return jsonError(e);
  }
}
