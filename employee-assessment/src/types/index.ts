export type Role =
  | "EMPLOYEE"
  | "MANAGER"
  | "COMMITTEE"
  | "EXECUTIVE"
  | "HR_ADMIN"
  | "SYSTEM_ADMIN";

export type CaseStatus =
  | "NOT_STARTED"
  | "SELF_DRAFT"
  | "SELF_SUBMITTED"
  | "MANAGER_DRAFT"
  | "MANAGER_SUBMITTED"
  | "COMMITTEE_IN_REVIEW"
  | "FINALIZED"
  | "PUBLISHED"
  | "RETURNED_TO_SELF"
  | "RETURNED_TO_MANAGER"
  | "CANCELLED"
  | "REOPENED_BY_HR";

export type Stage = "SELF" | "MANAGER" | "COMMITTEE";

export type ScopeType = "COMPANY" | "GROUP" | "TEAM" | "CASE" | "SELF";

export type QuestionType =
  | "rating"
  | "single_select"
  | "multi_select"
  | "textarea"
  | "number"
  | "date";

export interface User {
  userId: string;
  employeeCode: string;
  email: string;
  displayName: string;
  /** Demo/local login password — visible to HR Admin only in this Phase 0 store. */
  password: string;
  active: boolean;
  createdAt: string;
}

/** HR roster categories shown on admin user tables */
export type RosterRole = "EMPLOYEE" | "MANAGER" | "COMMITTEE";

export interface OrgUnit {
  orgUnitId: string;
  groupId: string | null;
  teamId: string | null;
  name: string;
  parentId: string | null;
  active: boolean;
  kind: "COMPANY" | "GROUP" | "TEAM";
}

export interface Membership {
  userId: string;
  orgUnitId: string;
  managerUserId: string | null;
  validFrom: string;
  validTo: string | null;
}

export interface RoleAssignment {
  assignmentId: string;
  userId: string;
  role: Role;
  scopeType: ScopeType;
  scopeId: string | null;
  cycleId: string | null;
  active: boolean;
}

export interface Cycle {
  cycleId: string;
  name: string;
  startsAt: string;
  selfDeadline: string;
  managerDeadline: string;
  committeeDeadline: string;
  publishedAt: string | null;
  status: "DRAFT" | "OPEN" | "CLOSED" | "PUBLISHED";
}

export interface FormQuestion {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  min?: number;
  max?: number;
  weight?: number;
  dimension?: string;
  maxLength?: number;
  options?: string[];
}

export interface FormSection {
  id: string;
  title: string;
  questions: FormQuestion[];
}

export interface FormSchema {
  formId: string;
  version: number;
  stage: Stage;
  title: string;
  sections: FormSection[];
}

export interface FormVersion {
  formVersionId: string;
  role: Stage;
  cycleId: string;
  version: number;
  schemaJson: FormSchema;
  scoringConfigJson: ScoringConfig;
  frozenAt: string | null;
}

export interface ScoringConfig {
  method: "weighted_mean";
  missingRequiredBlocksSubmit: boolean;
  notApplicablePolicy: "exclude";
}

export interface AssessmentCase {
  caseId: string;
  cycleId: string;
  employeeUserId: string;
  managerUserId: string;
  status: CaseStatus;
  selfFormVersionId: string;
  managerFormVersionId: string;
  committeeFormVersionId: string;
  updatedAt: string;
  version: number;
}

export interface CommitteeAssignment {
  caseId: string;
  reviewerUserId: string;
  status: "ASSIGNED" | "RECUSED" | "COMPLETED";
  conflictDeclaredAt: string | null;
}

export interface ResponseItem {
  responseId: string;
  caseId: string;
  stage: Stage;
  evaluatorUserId: string;
  questionId: string;
  answerJson: unknown;
  formVersionId: string;
  draftRevision: number;
  updatedAt: string;
}

export interface Submission {
  submissionId: string;
  caseId: string;
  stage: Stage;
  evaluatorUserId: string;
  scoreJson: ScoreSnapshot;
  answersJson: Record<string, unknown>;
  submittedAt: string;
  revision: number;
  idempotencyKey: string;
}

export interface ScoreSnapshot {
  overall: number | null;
  byDimension: Record<string, number>;
  answeredCount: number;
  requiredCount: number;
}

export interface FinalResult {
  caseId: string;
  cycleId: string;
  finalScore: number | null;
  performanceScore: number | null;
  potentialScore: number | null;
  talentSegment: string | null;
  decisionNote: string;
  finalizedAt: string;
  publishedAt: string | null;
  resultVersion: number;
}

export interface DevelopmentPlan {
  planId: string;
  caseId: string;
  ownerUserId: string;
  skillGap: string;
  action: string;
  dueAt: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  reviewAt: string | null;
}

export interface AuditEvent {
  eventId: string;
  actorUserId: string;
  caseId: string | null;
  action: string;
  stage: Stage | null;
  oldStatus: CaseStatus | null;
  newStatus: CaseStatus | null;
  timestamp: string;
  requestId: string;
  metadataJson: Record<string, unknown>;
}

export interface ActorContext {
  user: User;
  roles: RoleAssignment[];
  memberships: Membership[];
}

export interface ApiErrorBody {
  error: string;
  code: string;
  requestId: string;
}
