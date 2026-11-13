import type {
  AssessmentCase,
  AuditEvent,
  FinalResult,
  FormVersion,
  ResponseItem,
  Submission,
  User,
} from "@/types";
import { createSeedStore } from "./seed";
import type { DataStore, Repository } from "./types";

const globalForStore = globalThis as unknown as {
  __assessmentStore?: DataStore;
};

function store(): DataStore {
  if (!globalForStore.__assessmentStore) {
    globalForStore.__assessmentStore = createSeedStore();
  }
  return globalForStore.__assessmentStore;
}

export function resetStore(): void {
  globalForStore.__assessmentStore = createSeedStore();
}

export const memoryRepository: Repository = {
  getStore: () => store(),

  findUserById(userId) {
    return store().users.find((u) => u.userId === userId);
  },

  findUserByEmail(email) {
    return store().users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  },

  listUsers() {
    return store().users;
  },

  getCurrentCycle() {
    return store().cycles.find((c) => c.status === "OPEN") ?? store().cycles[0];
  },

  getFormVersion(id) {
    return store().formVersions.find((f) => f.formVersionId === id);
  },

  getPublishedForm(cycleId, stage) {
    return store().formVersions.find(
      (f) => f.cycleId === cycleId && f.role === stage && f.frozenAt,
    );
  },

  getCase(caseId) {
    return store().cases.find((c) => c.caseId === caseId);
  },

  listCasesForEmployee(userId) {
    return store().cases.filter((c) => c.employeeUserId === userId);
  },

  listCasesForManager(managerUserId) {
    return store().cases.filter((c) => c.managerUserId === managerUserId);
  },

  listCommitteeCases(reviewerUserId) {
    const ids = new Set(
      store()
        .committeeAssignments.filter(
          (a) => a.reviewerUserId === reviewerUserId && a.status !== "RECUSED",
        )
        .map((a) => a.caseId),
    );
    return store().cases.filter((c) => ids.has(c.caseId));
  },

  getCommitteeAssignments(caseId) {
    return store().committeeAssignments.filter((a) => a.caseId === caseId);
  },

  getDraftAnswers(caseId, stage, evaluatorUserId) {
    const items = store().responses.filter(
      (r) =>
        r.caseId === caseId &&
        r.stage === stage &&
        r.evaluatorUserId === evaluatorUserId,
    );
    const answers: Record<string, unknown> = {};
    for (const item of items) {
      answers[item.questionId] = item.answerJson;
    }
    return answers;
  },

  upsertDraft(input) {
    const s = store();
    const existing = s.responses.filter(
      (r) =>
        r.caseId === input.caseId &&
        r.stage === input.stage &&
        r.evaluatorUserId === input.evaluatorUserId,
    );
    for (const item of existing) {
      const idx = s.responses.indexOf(item);
      if (idx >= 0) s.responses.splice(idx, 1);
    }
    const now = new Date().toISOString();
    const revision = (existing[0]?.draftRevision ?? 0) + 1;
    for (const [questionId, answerJson] of Object.entries(input.answers)) {
      s.responses.push({
        responseId: `${input.caseId}-${input.stage}-${questionId}`,
        caseId: input.caseId,
        stage: input.stage,
        evaluatorUserId: input.evaluatorUserId,
        questionId,
        answerJson,
        formVersionId: input.formVersionId,
        draftRevision: revision,
        updatedAt: now,
      } satisfies ResponseItem);
    }
  },

  findSubmissionByIdempotency(key) {
    return store().submissions.find((s) => s.idempotencyKey === key);
  },

  addSubmission(submission: Submission) {
    store().submissions.push(submission);
  },

  updateCase(caseId, patch) {
    const c = store().cases.find((x) => x.caseId === caseId);
    if (!c) throw new Error("Case not found");
    const nextVersion = patch.version ?? c.version + 1;
    Object.assign(c, patch, {
      updatedAt: new Date().toISOString(),
      version: nextVersion,
    });
    return c;
  },

  addFinalResult(result) {
    const s = store();
    const idx = s.finalResults.findIndex((f) => f.caseId === result.caseId);
    if (idx >= 0) s.finalResults[idx] = result;
    else s.finalResults.push(result);
  },

  getFinalResult(caseId) {
    return store().finalResults.find((f) => f.caseId === caseId);
  },

  listPublishedResults(cycleId) {
    return store().finalResults.filter(
      (f) => f.cycleId === cycleId && f.publishedAt,
    );
  },

  addAudit(event: AuditEvent) {
    store().auditLog.push(event);
  },

  listAudit(limit = 100) {
    return store().auditLog.slice(-limit).reverse();
  },

  getRoleAssignments(userId) {
    return store().roleAssignments.filter((r) => r.userId === userId);
  },

  getMemberships(userId) {
    return store().memberships.filter((m) => m.userId === userId);
  },

  getOrgUnit(orgUnitId) {
    return store().orgUnits.find((o) => o.orgUnitId === orgUnitId);
  },

  listOrgUnits() {
    return store().orgUnits;
  },
};

export type { User, AssessmentCase, FormVersion, FinalResult };
