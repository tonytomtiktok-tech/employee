import type { Role, RoleAssignment } from "@/types";

export const ALL_ROLES: Role[] = [
  "EMPLOYEE",
  "MANAGER",
  "COMMITTEE",
  "EXECUTIVE",
  "HR_ADMIN",
  "SYSTEM_ADMIN",
];

export const ROLE_LABELS_TH: Record<Role, string> = {
  EMPLOYEE: "พนักงาน",
  MANAGER: "หัวหน้างาน",
  COMMITTEE: "กรรมการ",
  EXECUTIVE: "ผู้บริหาร",
  HR_ADMIN: "HR Admin",
  SYSTEM_ADMIN: "System Admin",
};

export function activeRoles(assignments: RoleAssignment[]): Role[] {
  return [...new Set(assignments.filter((a) => a.active).map((a) => a.role))];
}

export function hasRole(assignments: RoleAssignment[], role: Role): boolean {
  return assignments.some((a) => a.active && a.role === role);
}

export function hasAnyRole(assignments: RoleAssignment[], roles: Role[]): boolean {
  return roles.some((r) => hasRole(assignments, r));
}
