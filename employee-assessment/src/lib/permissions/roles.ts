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
  EMPLOYEE: "ผู้ถูกประเมิน",
  MANAGER: "หัวหน้าประเมิน",
  COMMITTEE: "คณะกรรมการประเมิน",
  EXECUTIVE: "ผู้บริหาร",
  HR_ADMIN: "HR Admin",
  SYSTEM_ADMIN: "System Admin",
};

export const ROSTER_ROLES = ["EMPLOYEE", "MANAGER", "COMMITTEE"] as const;

export function parseRosterRoleLabel(raw: string): Role | null {
  const t = raw.trim().toLowerCase();
  const map: Record<string, Role> = {
    employee: "EMPLOYEE",
    assessee: "EMPLOYEE",
    ผู้ถูกประเมิน: "EMPLOYEE",
    พนักงาน: "EMPLOYEE",
    manager: "MANAGER",
    หัวหน้าประเมิน: "MANAGER",
    หัวหน้างาน: "MANAGER",
    หัวหน้า: "MANAGER",
    committee: "COMMITTEE",
    คณะกรรมการประเมิน: "COMMITTEE",
    กรรมการ: "COMMITTEE",
    คณะกรรมการ: "COMMITTEE",
  };
  return map[t] ?? map[raw.trim()] ?? null;
}

export function activeRoles(assignments: RoleAssignment[]): Role[] {
  return [...new Set(assignments.filter((a) => a.active).map((a) => a.role))];
}

export function hasRole(assignments: RoleAssignment[], role: Role): boolean {
  return assignments.some((a) => a.active && a.role === role);
}

export function hasAnyRole(assignments: RoleAssignment[], roles: Role[]): boolean {
  return roles.some((r) => hasRole(assignments, r));
}
