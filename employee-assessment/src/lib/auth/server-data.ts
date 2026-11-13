import { activeRoles } from "@/lib/permissions/roles";
import { requireActor } from "./session";

export async function getShellData() {
  const actor = await requireActor();
  return {
    user: actor.user,
    roles: activeRoles(actor.roles),
    actor,
  };
}
