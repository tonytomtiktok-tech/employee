import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { finalizeBodySchema } from "@/lib/forms/schema";
import { finalizeCase } from "@/lib/services/cases";
import { jsonError } from "@/lib/api/errors";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireActor();
    const { id } = await context.params;
    const body = finalizeBodySchema.parse(await request.json());
    const result = finalizeCase(actor, id, body);
    return NextResponse.json(result);
  } catch (e) {
    return jsonError(e);
  }
}
