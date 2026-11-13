import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { hasRole } from "@/lib/permissions/roles";
import { PermissionError } from "@/lib/permissions/policy";
import { memoryRepository } from "@/lib/repository/memory";
import { jsonError } from "@/lib/api/errors";

export async function GET() {
  try {
    const actor = await requireActor();
    if (!hasRole(actor.roles, "MANAGER") && !hasRole(actor.roles, "HR_ADMIN")) {
      throw new PermissionError();
    }
    const cases = memoryRepository.listCasesForManager(actor.user.userId);
    const enriched = cases.map((c) => ({
      ...c,
      employee: memoryRepository.findUserById(c.employeeUserId),
    }));
    return NextResponse.json({ cases: enriched });
  } catch (e) {
    return jsonError(e);
  }
}
