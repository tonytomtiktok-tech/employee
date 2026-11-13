import { assertCan } from "@/lib/permissions/policy";
import { ROLE_LABELS_TH, parseRosterRoleLabel } from "@/lib/permissions/roles";
import { memoryRepository } from "@/lib/repository/memory";
import { newId } from "@/lib/utils/id";
import { writeAudit } from "./audit";
import type { ActorContext, Role, RosterRole, User } from "@/types";

export type RosterUserRow = {
  userId: string;
  employeeCode: string;
  password: string;
  displayName: string;
  email: string;
  role: RosterRole;
  roleLabel: string;
  active: boolean;
};

function defaultEmail(employeeCode: string): string {
  const slug = employeeCode.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${slug || "user"}@demo.local`;
}

function randomPassword(employeeCode: string): string {
  return `Demo@${employeeCode}`;
}

export function listRosterUsers(actor: ActorContext): {
  employees: RosterUserRow[];
  managers: RosterUserRow[];
  committee: RosterUserRow[];
} {
  assertCan("admin_manage", actor);
  const store = memoryRepository.getStore();
  const byRole = (role: RosterRole): RosterUserRow[] => {
    const rows: RosterUserRow[] = [];
    for (const a of store.roleAssignments) {
      if (!a.active || a.role !== role) continue;
      const user = store.users.find((u) => u.userId === a.userId);
      if (!user || !user.active) continue;
      rows.push({
        userId: user.userId,
        employeeCode: user.employeeCode,
        password: user.password,
        displayName: user.displayName,
        email: user.email,
        role,
        roleLabel: ROLE_LABELS_TH[role],
        active: user.active,
      });
    }
    return rows.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
  };

  return {
    employees: byRole("EMPLOYEE"),
    managers: byRole("MANAGER"),
    committee: byRole("COMMITTEE"),
  };
}

export function createRosterUser(
  actor: ActorContext,
  input: {
    employeeCode: string;
    displayName: string;
    password?: string;
    email?: string;
    role: RosterRole;
  },
): RosterUserRow {
  assertCan("admin_manage", actor);
  const store = memoryRepository.getStore();
  const code = input.employeeCode.trim();
  const name = input.displayName.trim();
  if (!code || !name) throw Object.assign(new Error("ต้องระบุรหัสและชื่อ"), { code: "VALIDATION" });

  if (store.users.some((u) => u.employeeCode.toLowerCase() === code.toLowerCase())) {
    throw Object.assign(new Error("รหัสพนักงานซ้ำ"), { code: "VALIDATION" });
  }

  const email = (input.email?.trim() || defaultEmail(code)).toLowerCase();
  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    throw Object.assign(new Error("อีเมลซ้ำ"), { code: "VALIDATION" });
  }

  const password = input.password?.trim() || randomPassword(code);
  const cycle = memoryRepository.getCurrentCycle();
  const user: User = {
    userId: newId(),
    employeeCode: code,
    email,
    displayName: name,
    password,
    active: true,
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);

  const company = store.orgUnits.find((o) => o.kind === "COMPANY");
  const team = store.orgUnits.find((o) => o.kind === "TEAM");
  store.roleAssignments.push({
    assignmentId: newId(),
    userId: user.userId,
    role: input.role,
    scopeType:
      input.role === "EMPLOYEE"
        ? "SELF"
        : input.role === "MANAGER"
          ? "TEAM"
          : "COMPANY",
    scopeId:
      input.role === "EMPLOYEE"
        ? user.userId
        : input.role === "MANAGER"
          ? (team?.orgUnitId ?? null)
          : (company?.orgUnitId ?? null),
    cycleId: cycle?.cycleId ?? null,
    active: true,
  });

  // Assessees (and others who may also self-assess) get a case when EMPLOYEE
  if (input.role === "EMPLOYEE" && cycle) {
    const managers = store.roleAssignments
      .filter((a) => a.active && a.role === "MANAGER")
      .map((a) => a.userId);
    const managerUserId = managers[0] ?? user.userId;
    const caseId = `case-${user.userId}`;
    store.cases.push({
      caseId,
      cycleId: cycle.cycleId,
      employeeUserId: user.userId,
      managerUserId,
      status: "NOT_STARTED",
      selfFormVersionId: "fv-self-1",
      managerFormVersionId: "fv-mgr-1",
      committeeFormVersionId: "fv-com-1",
      updatedAt: new Date().toISOString(),
      version: 0,
    });
    store.memberships.push({
      userId: user.userId,
      orgUnitId: team?.orgUnitId ?? company?.orgUnitId ?? "org-company",
      managerUserId: managerUserId === user.userId ? null : managerUserId,
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: null,
    });
  }

  writeAudit({
    actor,
    action: "ADMIN_CREATE_USER",
    metadata: { userId: user.userId, role: input.role, employeeCode: code },
  });

  return {
    userId: user.userId,
    employeeCode: user.employeeCode,
    password: user.password,
    displayName: user.displayName,
    email: user.email,
    role: input.role,
    roleLabel: ROLE_LABELS_TH[input.role],
    active: true,
  };
}

export function importRosterRows(
  actor: ActorContext,
  rows: {
    employeeCode: string;
    displayName: string;
    password?: string;
    email?: string;
    role: string;
  }[],
): { accepted: RosterUserRow[]; rejected: { row: unknown; reason: string }[] } {
  assertCan("admin_manage", actor);
  const accepted: RosterUserRow[] = [];
  const rejected: { row: unknown; reason: string }[] = [];

  for (const row of rows) {
    const role = parseRosterRoleLabel(row.role) as RosterRole | null;
    if (!role || !["EMPLOYEE", "MANAGER", "COMMITTEE"].includes(role)) {
      rejected.push({ row, reason: "บทบาทไม่รองรับ (ใช้ ผู้ถูกประเมิน / หัวหน้าประเมิน / คณะกรรมการประเมิน)" });
      continue;
    }
    try {
      accepted.push(
        createRosterUser(actor, {
          employeeCode: row.employeeCode,
          displayName: row.displayName,
          password: row.password,
          email: row.email,
          role,
        }),
      );
    } catch (e) {
      rejected.push({
        row,
        reason: e instanceof Error ? e.message : "นำเข้าไม่สำเร็จ",
      });
    }
  }

  return { accepted, rejected };
}

export function resolveRoleFromCell(value: unknown): Role | null {
  if (value == null) return null;
  return parseRosterRoleLabel(String(value));
}
