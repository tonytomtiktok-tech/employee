import { cookies } from "next/headers";
import type { ActorContext } from "@/types";
import { memoryRepository } from "@/lib/repository/memory";
import { DEMO_ACCOUNTS } from "@/lib/repository/seed";

export const SESSION_COOKIE = "ea_demo_user";

/** Phase 0/1: demo session via cookie. Replace with Auth.js SSO in Phase 1. */
export async function getSessionEmail(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function getActor(): Promise<ActorContext | null> {
  const email = (await getSessionEmail()) ?? DEMO_ACCOUNTS.employee;
  const user = memoryRepository.findUserByEmail(email);
  if (!user || !user.active) return null;
  return {
    user,
    roles: memoryRepository.getRoleAssignments(user.userId),
    memberships: memoryRepository.getMemberships(user.userId),
  };
}

export async function requireActor(): Promise<ActorContext> {
  const actor = await getActor();
  if (!actor) {
    throw new Error("UNAUTHENTICATED");
  }
  return actor;
}

export function listDemoAccounts() {
  return [
    { label: "พนักงาน", email: DEMO_ACCOUNTS.employee },
    { label: "หัวหน้างาน", email: DEMO_ACCOUNTS.manager },
    { label: "กรรมการ", email: DEMO_ACCOUNTS.committee },
    { label: "ผู้บริหาร", email: DEMO_ACCOUNTS.executive },
    { label: "HR Admin", email: DEMO_ACCOUNTS.hr },
  ];
}
