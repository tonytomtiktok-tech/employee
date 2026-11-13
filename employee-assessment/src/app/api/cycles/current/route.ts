import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { memoryRepository } from "@/lib/repository/memory";
import { jsonError } from "@/lib/api/errors";

export async function GET() {
  try {
    await requireActor();
    const cycle = memoryRepository.getCurrentCycle();
    return NextResponse.json({ cycle });
  } catch (e) {
    return jsonError(e);
  }
}
