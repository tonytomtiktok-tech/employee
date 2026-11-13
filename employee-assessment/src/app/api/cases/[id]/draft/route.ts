import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { draftBodySchema } from "@/lib/forms/schema";
import { saveDraft } from "@/lib/services/cases";
import { jsonError } from "@/lib/api/errors";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireActor();
    const { id } = await context.params;
    const body = draftBodySchema.parse(await request.json());
    const updated = saveDraft(
      actor,
      id,
      body.stage,
      body.answers,
      body.expectedVersion,
    );
    return NextResponse.json({ case: updated });
  } catch (e) {
    return jsonError(e);
  }
}
