import type { ActorContext } from "@/types";
import { memoryRepository } from "@/lib/repository/memory";
import { DEMO_ACCOUNTS } from "@/lib/repository/seed";
import { activeRoles } from "@/lib/permissions/roles";

export const SESSION_KEY = "ea_demo_user";

export function listDemoAccounts() {
  return [
    { label: "พนักงาน", email: DEMO_ACCOUNTS.employee },
    { label: "หัวหน้างาน", email: DEMO_ACCOUNTS.manager },
    { label: "กรรมการ", email: DEMO_ACCOUNTS.committee },
    { label: "ผู้บริหาร", email: DEMO_ACCOUNTS.executive },
    { label: "HR Admin", email: DEMO_ACCOUNTS.hr },
  ];
}

export function readSessionEmail(): string {
  if (typeof window === "undefined") return DEMO_ACCOUNTS.employee;
  return localStorage.getItem(SESSION_KEY) ?? DEMO_ACCOUNTS.employee;
}

export function writeSessionEmail(email: string) {
  localStorage.setItem(SESSION_KEY, email);
}

export function getActorFromEmail(email: string): ActorContext | null {
  const user = memoryRepository.findUserByEmail(email);
  if (!user || !user.active) return null;
  return {
    user,
    roles: memoryRepository.getRoleAssignments(user.userId),
    memberships: memoryRepository.getMemberships(user.userId),
  };
}

export function requireActorSync(): ActorContext {
  const actor = getActorFromEmail(readSessionEmail());
  if (!actor) throw new Error("UNAUTHENTICATED");
  return actor;
}

export function getShellDataSync() {
  const actor = requireActorSync();
  return {
    user: actor.user,
    roles: activeRoles(actor.roles),
    actor,
  };
}
