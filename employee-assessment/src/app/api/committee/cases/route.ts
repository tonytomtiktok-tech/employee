import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { getCommitteeCases } from "@/lib/services/cases";
import { memoryRepository } from "@/lib/repository/memory";
import { jsonError } from "@/lib/api/errors";

export async function GET() {
  try {
    const actor = await requireActor();
    const cases = getCommitteeCases(actor).map((c) => ({
      ...c,
      employee: memoryRepository.findUserById(c.employeeUserId),
    }));
    return NextResponse.json({ cases });
  } catch (e) {
    return jsonError(e);
  }
}
