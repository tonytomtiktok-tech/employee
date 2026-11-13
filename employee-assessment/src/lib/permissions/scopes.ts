import type { ActorContext, AssessmentCase, RoleAssignment, ScopeType } from "@/types";
import { hasRole } from "./roles";

export const PRIVACY_THRESHOLD = 5;

export function scopesForRole(
  assignments: RoleAssignment[],
  role: RoleAssignment["role"],
): RoleAssignment[] {
  return assignments.filter((a) => a.active && a.role === role);
}

export function actorOwnsCase(actor: ActorContext, assessmentCase: AssessmentCase): boolean {
  return actor.user.userId === assessmentCase.employeeUserId;
}

export function actorManagesCase(actor: ActorContext, assessmentCase: AssessmentCase): boolean {
  return (
    hasRole(actor.roles, "MANAGER") &&
    actor.user.userId === assessmentCase.managerUserId
  );
}

export function actorHasOrgScope(
  actor: ActorContext,
  scopeType: ScopeType,
  scopeId: string | null,
): boolean {
  if (hasRole(actor.roles, "HR_ADMIN")) return true;
  return actor.roles.some(
    (a) =>
      a.active &&
      (a.role === "EXECUTIVE" || a.role === "MANAGER") &&
      a.scopeType === scopeType &&
      (scopeId == null || a.scopeId === scopeId || a.scopeType === "COMPANY"),
  );
}

export function suppressSmallN(count: number, threshold = PRIVACY_THRESHOLD): boolean {
  return count > 0 && count < threshold;
}
