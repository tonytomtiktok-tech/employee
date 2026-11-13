import type {
  AssessmentCase,
  AuditEvent,
  CommitteeAssignment,
  Cycle,
  FinalResult,
  FormVersion,
  Membership,
  OrgUnit,
  ResponseItem,
  RoleAssignment,
  Submission,
  User,
} from "@/types";

export interface DataStore {
  users: User[];
  orgUnits: OrgUnit[];
  memberships: Membership[];
  roleAssignments: RoleAssignment[];
  cycles: Cycle[];
  formVersions: FormVersion[];
  cases: AssessmentCase[];
  committeeAssignments: CommitteeAssignment[];
  responses: ResponseItem[];
  submissions: Submission[];
  finalResults: FinalResult[];
  auditLog: AuditEvent[];
}

export interface Repository {
  getStore(): DataStore;
  findUserById(userId: string): User | undefined;
  findUserByEmail(email: string): User | undefined;
  listUsers(): User[];
  getCurrentCycle(): Cycle | undefined;
  getFormVersion(id: string): FormVersion | undefined;
  getPublishedForm(cycleId: string, stage: FormVersion["role"]): FormVersion | undefined;
  getCase(caseId: string): AssessmentCase | undefined;
  listCasesForEmployee(userId: string): AssessmentCase[];
  listCasesForManager(managerUserId: string): AssessmentCase[];
  listCommitteeCases(reviewerUserId: string): AssessmentCase[];
  getCommitteeAssignments(caseId: string): CommitteeAssignment[];
  getDraftAnswers(caseId: string, stage: string, evaluatorUserId: string): Record<string, unknown>;
  upsertDraft(input: {
    caseId: string;
    stage: ResponseItem["stage"];
    evaluatorUserId: string;
    formVersionId: string;
    answers: Record<string, unknown>;
  }): void;
  findSubmissionByIdempotency(key: string): Submission | undefined;
  addSubmission(submission: Submission): void;
  updateCase(caseId: string, patch: Partial<AssessmentCase>): AssessmentCase;
  addFinalResult(result: FinalResult): void;
  getFinalResult(caseId: string): FinalResult | undefined;
  listPublishedResults(cycleId: string): FinalResult[];
  addAudit(event: AuditEvent): void;
  listAudit(limit?: number): AuditEvent[];
  getRoleAssignments(userId: string): RoleAssignment[];
  getMemberships(userId: string): Membership[];
  getOrgUnit(orgUnitId: string): OrgUnit | undefined;
  listOrgUnits(): OrgUnit[];
}
