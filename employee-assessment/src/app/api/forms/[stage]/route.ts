import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { memoryRepository } from "@/lib/repository/memory";
import { jsonError } from "@/lib/api/errors";
import type { Stage } from "@/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ stage: string }> },
) {
  try {
    await requireActor();
    const { stage } = await context.params;
    const url = new URL(request.url);
    const cycleId =
      url.searchParams.get("cycleId") ??
      memoryRepository.getCurrentCycle()?.cycleId;
    if (!cycleId) {
      return NextResponse.json({ error: "no cycle" }, { status: 404 });
    }
    const form = memoryRepository.getPublishedForm(
      cycleId,
      stage.toUpperCase() as Stage,
    );
    if (!form) {
      return NextResponse.json({ error: "form not found" }, { status: 404 });
    }
    return NextResponse.json({
      formVersionId: form.formVersionId,
      version: form.version,
      schema: form.schemaJson,
      scoring: form.scoringConfigJson,
      frozenAt: form.frozenAt,
    });
  } catch (e) {
    return jsonError(e);
  }
}
