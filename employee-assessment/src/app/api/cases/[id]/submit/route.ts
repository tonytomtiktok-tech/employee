import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { submitBodySchema } from "@/lib/forms/schema";
import { submitStage } from "@/lib/services/cases";
import { jsonError } from "@/lib/api/errors";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireActor();
    const { id } = await context.params;
    const body = submitBodySchema.parse(await request.json());
    const result = submitStage(
      actor,
      id,
      body.stage,
      body.answers,
      body.expectedVersion,
      body.idempotencyKey,
    );
    return NextResponse.json(result);
  } catch (e) {
    return jsonError(e);
  }
}
