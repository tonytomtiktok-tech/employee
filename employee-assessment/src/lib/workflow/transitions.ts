import type { CaseStatus, Role, Stage } from "@/types";

export type TransitionAction =
  | "START_SELF"
  | "SAVE_SELF_DRAFT"
  | "SUBMIT_SELF"
  | "START_MANAGER"
  | "SAVE_MANAGER_DRAFT"
  | "SUBMIT_MANAGER"
  | "START_COMMITTEE"
  | "FINALIZE"
  | "PUBLISH"
  | "RETURN_TO_SELF"
  | "RETURN_TO_MANAGER"
  | "CANCEL"
  | "REOPEN_BY_HR";

interface TransitionRule {
  from: CaseStatus[];
  to: CaseStatus;
  action: TransitionAction;
  allowedRoles: Role[];
  stage?: Stage;
}

export const TRANSITIONS: TransitionRule[] = [
  {
    from: ["NOT_STARTED", "RETURNED_TO_SELF", "REOPENED_BY_HR"],
    to: "SELF_DRAFT",
    action: "START_SELF",
    allowedRoles: ["EMPLOYEE", "HR_ADMIN"],
    stage: "SELF",
  },
  {
    from: ["NOT_STARTED", "SELF_DRAFT", "RETURNED_TO_SELF", "REOPENED_BY_HR"],
    to: "SELF_DRAFT",
    action: "SAVE_SELF_DRAFT",
    allowedRoles: ["EMPLOYEE", "HR_ADMIN"],
    stage: "SELF",
  },
  {
    from: ["NOT_STARTED", "SELF_DRAFT", "RETURNED_TO_SELF", "REOPENED_BY_HR"],
    to: "SELF_SUBMITTED",
    action: "SUBMIT_SELF",
    allowedRoles: ["EMPLOYEE", "HR_ADMIN"],
    stage: "SELF",
  },
  {
    from: ["SELF_SUBMITTED", "RETURNED_TO_MANAGER"],
    to: "MANAGER_DRAFT",
    action: "START_MANAGER",
    allowedRoles: ["MANAGER", "HR_ADMIN"],
    stage: "MANAGER",
  },
  {
    from: ["SELF_SUBMITTED", "MANAGER_DRAFT", "RETURNED_TO_MANAGER"],
    to: "MANAGER_DRAFT",
    action: "SAVE_MANAGER_DRAFT",
    allowedRoles: ["MANAGER", "HR_ADMIN"],
    stage: "MANAGER",
  },
  {
    from: ["SELF_SUBMITTED", "MANAGER_DRAFT", "RETURNED_TO_MANAGER"],
    to: "MANAGER_SUBMITTED",
    action: "SUBMIT_MANAGER",
    allowedRoles: ["MANAGER", "HR_ADMIN"],
    stage: "MANAGER",
  },
  {
    from: ["MANAGER_SUBMITTED"],
    to: "COMMITTEE_IN_REVIEW",
    action: "START_COMMITTEE",
    allowedRoles: ["COMMITTEE", "HR_ADMIN"],
    stage: "COMMITTEE",
  },
  {
    from: ["MANAGER_SUBMITTED", "COMMITTEE_IN_REVIEW"],
    to: "FINALIZED",
    action: "FINALIZE",
    allowedRoles: ["COMMITTEE", "HR_ADMIN"],
    stage: "COMMITTEE",
  },
  {
    from: ["FINALIZED"],
    to: "PUBLISHED",
    action: "PUBLISH",
    allowedRoles: ["HR_ADMIN"],
  },
  {
    from: ["SELF_SUBMITTED", "MANAGER_DRAFT", "MANAGER_SUBMITTED", "COMMITTEE_IN_REVIEW"],
    to: "RETURNED_TO_SELF",
    action: "RETURN_TO_SELF",
    allowedRoles: ["MANAGER", "COMMITTEE", "HR_ADMIN"],
  },
  {
    from: ["MANAGER_SUBMITTED", "COMMITTEE_IN_REVIEW"],
    to: "RETURNED_TO_MANAGER",
    action: "RETURN_TO_MANAGER",
    allowedRoles: ["COMMITTEE", "HR_ADMIN"],
  },
  {
    from: CASE_STATUSES_CANCELLABLE(),
    to: "CANCELLED",
    action: "CANCEL",
    allowedRoles: ["HR_ADMIN"],
  },
  {
    from: ["CANCELLED", "FINALIZED", "PUBLISHED"],
    to: "REOPENED_BY_HR",
    action: "REOPEN_BY_HR",
    allowedRoles: ["HR_ADMIN"],
  },
];

function CASE_STATUSES_CANCELLABLE(): CaseStatus[] {
  return [
    "NOT_STARTED",
    "SELF_DRAFT",
    "SELF_SUBMITTED",
    "MANAGER_DRAFT",
    "MANAGER_SUBMITTED",
    "COMMITTEE_IN_REVIEW",
    "RETURNED_TO_SELF",
    "RETURNED_TO_MANAGER",
    "REOPENED_BY_HR",
  ];
}

export function canTransition(
  from: CaseStatus,
  action: TransitionAction,
  role: Role,
): CaseStatus | null {
  const rule = TRANSITIONS.find(
    (t) => t.action === action && t.from.includes(from) && t.allowedRoles.includes(role),
  );
  return rule?.to ?? null;
}

export function assertTransition(
  from: CaseStatus,
  action: TransitionAction,
  roles: Role[],
): CaseStatus {
  for (const role of roles) {
    const next = canTransition(from, action, role);
    if (next) return next;
  }
  throw new Error(`Transition not allowed: ${action} from ${from}`);
}
