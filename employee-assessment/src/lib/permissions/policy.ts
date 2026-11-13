import type {
  ActorContext,
  AssessmentCase,
  CaseStatus,
  CommitteeAssignment,
  Stage,
} from "@/types";
import { hasAnyRole, hasRole } from "./roles";
import { actorManagesCase, actorOwnsCase } from "./scopes";

export type Action =
  | "read_own_case"
  | "write_self_draft"
  | "submit_self"
  | "read_manager_case"
  | "write_manager_draft"
  | "submit_manager"
  | "read_committee_case"
  | "write_committee"
  | "finalize"
  | "publish"
  | "read_dashboard_aggregate"
  | "read_dashboard_identifiable"
  | "admin_manage"
  | "read_audit";

export class PermissionError extends Error {
  code = "FORBIDDEN";
  constructor(message = "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้") {
    super(message);
    this.name = "PermissionError";
  }
}

export function assertCan(
  action: Action,
  actor: ActorContext,
  ctx: {
    assessmentCase?: AssessmentCase;
    committeeAssignments?: CommitteeAssignment[];
    stage?: Stage;
  } = {},
): void {
  const { assessmentCase, committeeAssignments = [], stage } = ctx;

  // HR admin may perform operational actions; identifiable drill-down still goes through its case.
  if (hasRole(actor.roles, "HR_ADMIN") && action !== "read_dashboard_identifiable") {
    return;
  }

  switch (action) {
    case "read_own_case":
    case "write_self_draft":
    case "submit_self": {
      if (!assessmentCase || !actorOwnsCase(actor, assessmentCase)) {
        throw new PermissionError();
      }
      return;
    }
    case "read_manager_case":
    case "write_manager_draft":
    case "submit_manager": {
      if (!assessmentCase || !actorManagesCase(actor, assessmentCase)) {
        throw new PermissionError();
      }
      if (
        action !== "read_manager_case" &&
        !["SELF_SUBMITTED", "MANAGER_DRAFT", "RETURNED_TO_MANAGER"].includes(
          assessmentCase.status,
        )
      ) {
        throw new PermissionError("ยังไม่สามารถประเมินในขั้นตอนนี้ได้");
      }
      return;
    }
    case "read_committee_case":
    case "write_committee":
    case "finalize": {
      if (!assessmentCase || !hasRole(actor.roles, "COMMITTEE")) {
        throw new PermissionError();
      }
      const assignment = committeeAssignments.find(
        (a) =>
          a.caseId === assessmentCase.caseId &&
          a.reviewerUserId === actor.user.userId,
      );
      if (!assignment || assignment.status === "RECUSED") {
        throw new PermissionError();
      }
      if (assignment.reviewerUserId === assessmentCase.employeeUserId) {
        throw new PermissionError("มีความขัดแย้งทางผลประโยชน์");
      }
      if (
        action === "finalize" &&
        !["MANAGER_SUBMITTED", "COMMITTEE_IN_REVIEW"].includes(assessmentCase.status)
      ) {
        throw new PermissionError("ยังไม่สามารถสรุปผลได้");
      }
      return;
    }
    case "publish": {
      if (!hasRole(actor.roles, "HR_ADMIN")) throw new PermissionError();
      if (assessmentCase && assessmentCase.status !== "FINALIZED") {
        throw new PermissionError("เผยแพร่ได้เฉพาะเคสที่สรุปผลแล้ว");
      }
      return;
    }
    case "read_dashboard_aggregate": {
      if (!hasAnyRole(actor.roles, ["EXECUTIVE", "HR_ADMIN", "MANAGER"])) {
        throw new PermissionError();
      }
      return;
    }
    case "read_dashboard_identifiable": {
      if (!hasAnyRole(actor.roles, ["EXECUTIVE", "HR_ADMIN"])) {
        throw new PermissionError();
      }
      const allowed = actor.roles.some(
        (r) =>
          r.active &&
          (r.role === "HR_ADMIN" ||
            (r.role === "EXECUTIVE" && r.scopeType === "COMPANY")),
      );
      if (!allowed) throw new PermissionError("ไม่มีสิทธิ์ดูรายบุคคล");
      return;
    }
    case "admin_manage":
    case "read_audit": {
      if (!hasRole(actor.roles, "HR_ADMIN")) throw new PermissionError();
      return;
    }
    default: {
      void stage;
      throw new PermissionError();
    }
  }
}

export function redactCaseForRole(
  assessmentCase: AssessmentCase,
  actor: ActorContext,
  options: {
    isCommitteeAssigned: boolean;
    releaseScoresToEmployee?: boolean;
  },
): Partial<AssessmentCase> & { caseId: string; status: CaseStatus } {
  const base = {
    caseId: assessmentCase.caseId,
    cycleId: assessmentCase.cycleId,
    status: assessmentCase.status,
    updatedAt: assessmentCase.updatedAt,
    version: assessmentCase.version,
  };

  if (hasRole(actor.roles, "HR_ADMIN")) return assessmentCase;
  if (actorOwnsCase(actor, assessmentCase)) {
    return {
      ...base,
      employeeUserId: assessmentCase.employeeUserId,
      selfFormVersionId: assessmentCase.selfFormVersionId,
    };
  }
  if (actorManagesCase(actor, assessmentCase)) {
    return {
      ...base,
      employeeUserId: assessmentCase.employeeUserId,
      managerUserId: assessmentCase.managerUserId,
      selfFormVersionId: assessmentCase.selfFormVersionId,
      managerFormVersionId: assessmentCase.managerFormVersionId,
    };
  }
  if (options.isCommitteeAssigned) {
    return {
      ...base,
      employeeUserId: assessmentCase.employeeUserId,
      managerUserId: assessmentCase.managerUserId,
      selfFormVersionId: assessmentCase.selfFormVersionId,
      managerFormVersionId: assessmentCase.managerFormVersionId,
      committeeFormVersionId: assessmentCase.committeeFormVersionId,
    };
  }
  throw new PermissionError();
}
