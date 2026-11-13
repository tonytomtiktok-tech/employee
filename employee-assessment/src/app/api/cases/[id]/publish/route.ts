import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { publishCase } from "@/lib/services/cases";
import { jsonError } from "@/lib/api/errors";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireActor();
    const { id } = await context.params;
    const updated = publishCase(actor, id);
    return NextResponse.json({ case: updated });
  } catch (e) {
    return jsonError(e);
  }
}
