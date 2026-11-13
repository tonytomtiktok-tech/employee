import selfForm from "@/config/mock-forms/self.json";
import managerForm from "@/config/mock-forms/manager.json";
import committeeForm from "@/config/mock-forms/committee.json";
import type {
  AssessmentCase,
  CommitteeAssignment,
  Cycle,
  FormSchema,
  FormVersion,
  Membership,
  OrgUnit,
  RoleAssignment,
  ScoringConfig,
  User,
} from "@/types";
import { newId } from "@/lib/utils/id";
import type { DataStore } from "./types";

const SCORING: ScoringConfig = {
  method: "weighted_mean",
  missingRequiredBlocksSubmit: true,
  notApplicablePolicy: "exclude",
};

const FIRST_NAMES = [
  "สมชาย", "สมหญิง", "อนุชา", "วิภา", "ธนา", "กมล", "ปิยะ", "นภา", "วราภรณ์", "ชัยวัฒน์",
  "สุนิสา", "อภิชาต", "มานี", "ประเสริฐ", "จินตนา", "ศิริพร", "ธีรพงษ์", "อรทัย", "พัชรินทร์", "กิตติ",
];
const LAST_NAMES = [
  "ใจดี", "สุขใจ", "รุ่งเรือง", "ทองคำ", "ศรีสุข", "บุญมี", "แซ่ลี", "วงศ์ดี", "พูนสุข", "เจริญ",
];

function demoEmail(index: number): string {
  return `emp${String(index).padStart(3, "0")}@demo.local`;
}

export function createSeedStore(): DataStore {
  const now = new Date().toISOString();
  const cycleId = "cycle-2026-h1";
  const companyId = "org-company";
  const groups: OrgUnit[] = [
    {
      orgUnitId: "org-g-ops",
      groupId: "g-ops",
      teamId: null,
      name: "กลุ่มปฏิบัติการ",
      parentId: companyId,
      active: true,
      kind: "GROUP",
    },
    {
      orgUnitId: "org-g-tech",
      groupId: "g-tech",
      teamId: null,
      name: "กลุ่มเทคโนโลยี",
      parentId: companyId,
      active: true,
      kind: "GROUP",
    },
    {
      orgUnitId: "org-g-comm",
      groupId: "g-comm",
      teamId: null,
      name: "กลุ่มพาณิชย์",
      parentId: companyId,
      active: true,
      kind: "GROUP",
    },
    {
      orgUnitId: "org-g-hr",
      groupId: "g-hr",
      teamId: null,
      name: "กลุ่มบุคคล",
      parentId: companyId,
      active: true,
      kind: "GROUP",
    },
  ];

  const teamDefs = [
    { id: "t-ops-1", group: "org-g-ops", name: "ทีมปฏิบัติการ 1" },
    { id: "t-ops-2", group: "org-g-ops", name: "ทีมปฏิบัติการ 2" },
    { id: "t-tech-1", group: "org-g-tech", name: "ทีมวิศวกรรม" },
    { id: "t-tech-2", group: "org-g-tech", name: "ทีมผลิตภัณฑ์" },
    { id: "t-comm-1", group: "org-g-comm", name: "ทีมขาย" },
    { id: "t-comm-2", group: "org-g-comm", name: "ทีมการตลาด" },
    { id: "t-hr-1", group: "org-g-hr", name: "ทีม HRBP" },
    { id: "t-hr-2", group: "org-g-hr", name: "ทีม Talent" },
  ];

  const teams: OrgUnit[] = teamDefs.map((t) => ({
    orgUnitId: `org-${t.id}`,
    groupId: groups.find((g) => g.orgUnitId === t.group)?.groupId ?? null,
    teamId: t.id,
    name: t.name,
    parentId: t.group,
    active: true,
    kind: "TEAM" as const,
  }));

  const orgUnits: OrgUnit[] = [
    {
      orgUnitId: companyId,
      groupId: null,
      teamId: null,
      name: "บริษัทตัวอย่าง จำกัด",
      parentId: null,
      active: true,
      kind: "COMPANY",
    },
    ...groups,
    ...teams,
  ];

  const users: User[] = [];
  const memberships: Membership[] = [];
  const roleAssignments: RoleAssignment[] = [];
  const cases: AssessmentCase[] = [];
  const committeeAssignments: CommitteeAssignment[] = [];

  // 8 managers (one per team), 4 committee, 2 executives, 1 HR, rest employees = 200
  const MANAGER_COUNT = 8;
  const COMMITTEE_COUNT = 4;
  const EXEC_COUNT = 2;
  const HR_COUNT = 1;
  const TOTAL = 200;

  for (let i = 1; i <= TOTAL; i++) {
    const first = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const last = LAST_NAMES[(i - 1) % LAST_NAMES.length];
    const user: User = {
      userId: `user-${String(i).padStart(3, "0")}`,
      employeeCode: `E${String(i).padStart(4, "0")}`,
      email: demoEmail(i),
      displayName: `${first} ${last}`,
      active: true,
      createdAt: now,
    };
    users.push(user);
  }

  const managers = users.slice(0, MANAGER_COUNT);
  const committee = users.slice(MANAGER_COUNT, MANAGER_COUNT + COMMITTEE_COUNT);
  const executives = users.slice(
    MANAGER_COUNT + COMMITTEE_COUNT,
    MANAGER_COUNT + COMMITTEE_COUNT + EXEC_COUNT,
  );
  const hrAdmin = users[MANAGER_COUNT + COMMITTEE_COUNT + EXEC_COUNT];

  managers.forEach((m, idx) => {
    const team = teams[idx];
    roleAssignments.push({
      assignmentId: newId(),
      userId: m.userId,
      role: "MANAGER",
      scopeType: "TEAM",
      scopeId: team.orgUnitId,
      cycleId,
      active: true,
    });
    roleAssignments.push({
      assignmentId: newId(),
      userId: m.userId,
      role: "EMPLOYEE",
      scopeType: "SELF",
      scopeId: m.userId,
      cycleId,
      active: true,
    });
    memberships.push({
      userId: m.userId,
      orgUnitId: team.orgUnitId,
      managerUserId: null,
      validFrom: "2026-01-01",
      validTo: null,
    });
  });

  committee.forEach((c) => {
    roleAssignments.push({
      assignmentId: newId(),
      userId: c.userId,
      role: "COMMITTEE",
      scopeType: "COMPANY",
      scopeId: companyId,
      cycleId,
      active: true,
    });
    roleAssignments.push({
      assignmentId: newId(),
      userId: c.userId,
      role: "EMPLOYEE",
      scopeType: "SELF",
      scopeId: c.userId,
      cycleId,
      active: true,
    });
    memberships.push({
      userId: c.userId,
      orgUnitId: teams[0].orgUnitId,
      managerUserId: managers[0].userId,
      validFrom: "2026-01-01",
      validTo: null,
    });
  });

  executives.forEach((e) => {
    roleAssignments.push({
      assignmentId: newId(),
      userId: e.userId,
      role: "EXECUTIVE",
      scopeType: "COMPANY",
      scopeId: companyId,
      cycleId,
      active: true,
    });
    memberships.push({
      userId: e.userId,
      orgUnitId: companyId,
      managerUserId: null,
      validFrom: "2026-01-01",
      validTo: null,
    });
  });

  roleAssignments.push({
    assignmentId: newId(),
    userId: hrAdmin.userId,
    role: "HR_ADMIN",
    scopeType: "COMPANY",
    scopeId: companyId,
    cycleId,
    active: true,
  });
  memberships.push({
    userId: hrAdmin.userId,
    orgUnitId: teams[6].orgUnitId,
    managerUserId: managers[6].userId,
    validFrom: "2026-01-01",
    validTo: null,
  });

  const specialCount = MANAGER_COUNT + COMMITTEE_COUNT + EXEC_COUNT + HR_COUNT;
  const employeeUsers = users.slice(specialCount);

  employeeUsers.forEach((u, idx) => {
    const teamIdx = idx % teams.length;
    const team = teams[teamIdx];
    const manager = managers[teamIdx];
    roleAssignments.push({
      assignmentId: newId(),
      userId: u.userId,
      role: "EMPLOYEE",
      scopeType: "SELF",
      scopeId: u.userId,
      cycleId,
      active: true,
    });
    memberships.push({
      userId: u.userId,
      orgUnitId: team.orgUnitId,
      managerUserId: manager.userId,
      validFrom: "2026-01-01",
      validTo: null,
    });
  });

  // Managers also report into themselves for their own case
  const formVersions: FormVersion[] = [
    {
      formVersionId: "fv-self-1",
      role: "SELF",
      cycleId,
      version: 1,
      schemaJson: selfForm as FormSchema,
      scoringConfigJson: SCORING,
      frozenAt: now,
    },
    {
      formVersionId: "fv-mgr-1",
      role: "MANAGER",
      cycleId,
      version: 1,
      schemaJson: managerForm as FormSchema,
      scoringConfigJson: SCORING,
      frozenAt: now,
    },
    {
      formVersionId: "fv-com-1",
      role: "COMMITTEE",
      cycleId,
      version: 1,
      schemaJson: committeeForm as FormSchema,
      scoringConfigJson: SCORING,
      frozenAt: now,
    },
  ];

  const peopleWithCases = [...managers, ...committee, hrAdmin, ...employeeUsers];
  peopleWithCases.forEach((u, idx) => {
    const membership = memberships.find((m) => m.userId === u.userId);
    const managerUserId =
      membership?.managerUserId ??
      managers[idx % managers.length].userId;
    // Avoid self-manager loop for managers: peer manager
    const resolvedManager =
      managerUserId === u.userId
        ? managers[(managers.findIndex((m) => m.userId === u.userId) + 1) % managers.length]
            .userId
        : managerUserId;

    const caseId = `case-${u.userId}`;
    cases.push({
      caseId,
      cycleId,
      employeeUserId: u.userId,
      managerUserId: resolvedManager,
      status: "NOT_STARTED",
      selfFormVersionId: "fv-self-1",
      managerFormVersionId: "fv-mgr-1",
      committeeFormVersionId: "fv-com-1",
      updatedAt: now,
      version: 0,
    });

    const reviewer = committee[idx % committee.length];
    if (reviewer.userId !== u.userId) {
      committeeAssignments.push({
        caseId,
        reviewerUserId: reviewer.userId,
        status: "ASSIGNED",
        conflictDeclaredAt: null,
      });
    } else {
      const alt = committee[(idx + 1) % committee.length];
      committeeAssignments.push({
        caseId,
        reviewerUserId: alt.userId,
        status: "ASSIGNED",
        conflictDeclaredAt: null,
      });
    }
  });

  const cycle: Cycle = {
    cycleId,
    name: "รอบประเมิน 2026 ครึ่งปีแรก",
    startsAt: "2026-01-15T00:00:00+07:00",
    selfDeadline: "2026-02-28T23:59:59+07:00",
    managerDeadline: "2026-03-20T23:59:59+07:00",
    committeeDeadline: "2026-04-10T23:59:59+07:00",
    publishedAt: null,
    status: "OPEN",
  };

  // Seed a few published cases for executive dashboard demos
  const publishedSlice = cases.slice(0, 12);
  const finalResults = publishedSlice.map((c, i) => {
    c.status = "PUBLISHED";
    c.version = 3;
    return {
      caseId: c.caseId,
      cycleId,
      finalScore: 3 + (i % 3) * 0.5,
      performanceScore: 3 + (i % 3) * 0.5,
      potentialScore: 3 + ((i + 1) % 3) * 0.5,
      talentSegment: i % 3 === 0 ? "High Performer" : "Core",
      decisionNote: "สรุปผลตัวอย่างสำหรับแดชบอร์ด",
      finalizedAt: now,
      publishedAt: now,
      resultVersion: 1,
    };
  });

  return {
    users,
    orgUnits,
    memberships,
    roleAssignments,
    cycles: [cycle],
    formVersions,
    cases,
    committeeAssignments,
    responses: [],
    submissions: [],
    finalResults,
    auditLog: [],
  };
}

export const DEMO_ACCOUNTS = {
  employee: "emp016@demo.local",
  manager: "emp001@demo.local",
  committee: "emp009@demo.local",
  executive: "emp013@demo.local",
  hr: "emp015@demo.local",
};
