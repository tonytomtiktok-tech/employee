import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { getMyCases } from "@/lib/services/cases";
import { jsonError } from "@/lib/api/errors";

export async function GET() {
  try {
    const actor = await requireActor();
    return NextResponse.json({ cases: getMyCases(actor) });
  } catch (e) {
    return jsonError(e);
  }
}
