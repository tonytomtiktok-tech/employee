import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { getCaseForActor } from "@/lib/services/cases";
import { jsonError } from "@/lib/api/errors";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireActor();
    const { id } = await context.params;
    const data = getCaseForActor(actor, id);
    return NextResponse.json(data);
  } catch (e) {
    return jsonError(e);
  }
}
