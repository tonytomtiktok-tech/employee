import { NextResponse } from "next/server";
import { requireActor, listDemoAccounts } from "@/lib/auth/session";
import { activeRoles } from "@/lib/permissions/roles";
import { jsonError } from "@/lib/api/errors";

export async function GET() {
  try {
    const actor = await requireActor();
    return NextResponse.json({
      user: actor.user,
      roles: activeRoles(actor.roles),
      roleAssignments: actor.roles,
      memberships: actor.memberships,
      demoAccounts: listDemoAccounts(),
    });
  } catch (e) {
    return jsonError(e);
  }
}
