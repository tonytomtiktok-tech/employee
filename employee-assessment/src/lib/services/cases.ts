import { assertCan, PermissionError } from "@/lib/permissions/policy";
import { memoryRepository } from "@/lib/repository/memory";
import { activeRoles, hasRole } from "@/lib/permissions/roles";
import { isDraftWritable } from "@/lib/workflow/states";
import { assertTransition } from "@/lib/workflow/transitions";
import { validateAnswers } from "@/lib/forms/validator";
import { computeScore } from "@/lib/forms/scoring";
import { writeAudit } from "./audit";
import { newId } from "@/lib/utils/id";
import type { ActorContext, Stage } from "@/types";

export function getMyCases(actor: ActorContext) {
  return memoryRepository.listCasesForEmployee(actor.user.userId);
}

export function getManagerCases(actor: ActorContext) {
  assertCan("read_manager_case", actor, {
    assessmentCase: {
      caseId: "probe",
      cycleId: "",
      employeeUserId: "",
      managerUserId: actor.user.userId,
      status: "SELF_SUBMITTED",
      selfFormVersionId: "",
      managerFormVersionId: "",
      committeeFormVersionId: "",
      updatedAt: "",
      version: 0,
    },
  });
  return memoryRepository.listCasesForManager(actor.user.userId);
}

export function getCommitteeCases(actor: ActorContext) {
  if (!hasRole(actor.roles, "COMMITTEE") && !hasRole(actor.roles, "HR_ADMIN")) {
    throw new PermissionError();
  }
  return memoryRepository.listCommitteeCases(actor.user.userId);
}

export function getCaseForActor(actor: ActorContext, caseId: string) {
  const assessmentCase = memoryRepository.getCase(caseId);
  if (!assessmentCase) {
    throw Object.assign(new Error("ไม่พบเคส"), { code: "NOT_FOUND" });
  }

  const committeeAssignments = memoryRepository.getCommitteeAssignments(caseId);
  const isCommittee = committeeAssignments.some(
    (a) => a.reviewerUserId === actor.user.userId && a.status !== "RECUSED",
  );

  try {
    if (assessmentCase.employeeUserId === actor.user.userId) {
      assertCan("read_own_case", actor, { assessmentCase });
    } else if (assessmentCase.managerUserId === actor.user.userId) {
      assertCan("read_manager_case", actor, { assessmentCase });
    } else if (isCommittee) {
      assertCan("read_committee_case", actor, {
        assessmentCase,
        committeeAssignments,
      });
    } else if (hasRole(actor.roles, "HR_ADMIN")) {
      assertCan("admin_manage", actor);
    } else {
      throw new PermissionError();
    }
  } catch (e) {
    if (e instanceof PermissionError) {
      throw Object.assign(new Error("ไม่พบเคส"), { code: "NOT_FOUND" });
    }
    throw e;
  }

  const employee = memoryRepository.findUserById(assessmentCase.employeeUserId);
  const selfAnswers =
    ["SELF_SUBMITTED", "MANAGER_DRAFT", "MANAGER_SUBMITTED", "COMMITTEE_IN_REVIEW", "FINALIZED", "PUBLISHED"].includes(
      assessmentCase.status,
    ) || assessmentCase.employeeUserId === actor.user.userId
      ? memoryRepository.getDraftAnswers(caseId, "SELF", assessmentCase.employeeUserId)
      : undefined;

  const managerAnswers =
    assessmentCase.managerUserId === actor.user.userId ||
    isCommittee ||
    hasRole(actor.roles, "HR_ADMIN")
      ? memoryRepository.getDraftAnswers(caseId, "MANAGER", assessmentCase.managerUserId)
      : undefined;

  const myDraftStage: Stage | null =
    assessmentCase.employeeUserId === actor.user.userId
      ? "SELF"
      : assessmentCase.managerUserId === actor.user.userId
        ? "MANAGER"
        : isCommittee
          ? "COMMITTEE"
          : null;

  const draftAnswers = myDraftStage
    ? memoryRepository.getDraftAnswers(caseId, myDraftStage, actor.user.userId)
    : {};

  const submissions = memoryRepository
    .getStore()
    .submissions.filter((s) => s.caseId === caseId);

  return {
    case: assessmentCase,
    employee,
    draftAnswers,
    selfSubmission: submissions.find((s) => s.stage === "SELF") ?? null,
    managerSubmission: submissions.find((s) => s.stage === "MANAGER") ?? null,
    selfAnswers,
    managerAnswers,
    finalResult: memoryRepository.getFinalResult(caseId) ?? null,
  };
}

export function saveDraft(
  actor: ActorContext,
  caseId: string,
  stage: Stage,
  answers: Record<string, unknown>,
  expectedVersion: number,
) {
  const assessmentCase = memoryRepository.getCase(caseId);
  if (!assessmentCase) throw Object.assign(new Error("ไม่พบเคส"), { code: "NOT_FOUND" });
  if (assessmentCase.version !== expectedVersion) {
    throw Object.assign(new Error("มีการแก้ไขพร้อมกัน กรุณารีเฟรช"), {
      code: "CONFLICT",
    });
  }
  if (!isDraftWritable(assessmentCase.status, stage)) {
    throw new PermissionError("สถานะปัจจุบันไม่อนุญาตให้แก้ไขร่าง");
  }

  const committeeAssignments = memoryRepository.getCommitteeAssignments(caseId);
  if (stage === "SELF") assertCan("write_self_draft", actor, { assessmentCase });
  if (stage === "MANAGER") assertCan("write_manager_draft", actor, { assessmentCase });
  if (stage === "COMMITTEE") {
    assertCan("write_committee", actor, { assessmentCase, committeeAssignments });
  }

  const formVersionId =
    stage === "SELF"
      ? assessmentCase.selfFormVersionId
      : stage === "MANAGER"
        ? assessmentCase.managerFormVersionId
        : assessmentCase.committeeFormVersionId;

  memoryRepository.upsertDraft({
    caseId,
    stage,
    evaluatorUserId: actor.user.userId,
    formVersionId,
    answers,
  });

  const action =
    stage === "SELF"
      ? "SAVE_SELF_DRAFT"
      : stage === "MANAGER"
        ? "SAVE_MANAGER_DRAFT"
        : "START_COMMITTEE";
  const next = assertTransition(
    assessmentCase.status,
    action as "SAVE_SELF_DRAFT" | "SAVE_MANAGER_DRAFT" | "START_COMMITTEE",
    activeRoles(actor.roles),
  );

  const updated = memoryRepository.updateCase(caseId, { status: next });
  writeAudit({
    actor,
    action: "SAVE_DRAFT",
    caseId,
    stage,
    oldStatus: assessmentCase.status,
    newStatus: updated.status,
  });
  return updated;
}

export function submitStage(
  actor: ActorContext,
  caseId: string,
  stage: Stage,
  answers: Record<string, unknown>,
  expectedVersion: number,
  idempotencyKey: string,
) {
  const existing = memoryRepository.findSubmissionByIdempotency(idempotencyKey);
  if (existing) return { submission: existing, case: memoryRepository.getCase(caseId)! };

  const assessmentCase = memoryRepository.getCase(caseId);
  if (!assessmentCase) throw Object.assign(new Error("ไม่พบเคส"), { code: "NOT_FOUND" });
  if (assessmentCase.version !== expectedVersion) {
    throw Object.assign(new Error("มีการแก้ไขพร้อมกัน กรุณารีเฟรช"), {
      code: "CONFLICT",
    });
  }

  const committeeAssignments = memoryRepository.getCommitteeAssignments(caseId);
  if (stage === "SELF") assertCan("submit_self", actor, { assessmentCase });
  if (stage === "MANAGER") assertCan("submit_manager", actor, { assessmentCase });
  if (stage === "COMMITTEE") {
    throw new PermissionError("ใช้ endpoint finalize สำหรับกรรมการ");
  }

  const formVersionId =
    stage === "SELF"
      ? assessmentCase.selfFormVersionId
      : assessmentCase.managerFormVersionId;
  const form = memoryRepository.getFormVersion(formVersionId);
  if (!form?.frozenAt) throw new Error("แบบฟอร์มยังไม่ถูกแช่แข็ง");

  const issues = validateAnswers(form.schemaJson, answers);
  if (issues.length) {
    throw Object.assign(new Error("คำตอบไม่ครบหรือไม่ถูกต้อง"), {
      code: "VALIDATION",
      details: issues,
    });
  }

  memoryRepository.upsertDraft({
    caseId,
    stage,
    evaluatorUserId: actor.user.userId,
    formVersionId,
    answers,
  });

  const score = computeScore(form.schemaJson, answers, form.scoringConfigJson);
  const transitionAction = stage === "SELF" ? "SUBMIT_SELF" : "SUBMIT_MANAGER";
  const next = assertTransition(
    assessmentCase.status,
    transitionAction,
    activeRoles(actor.roles),
  );

  const submission = {
    submissionId: newId(),
    caseId,
    stage,
    evaluatorUserId: actor.user.userId,
    scoreJson: score,
    answersJson: answers,
    submittedAt: new Date().toISOString(),
    revision: 1,
    idempotencyKey,
  };
  memoryRepository.addSubmission(submission);
  const updated = memoryRepository.updateCase(caseId, { status: next });
  writeAudit({
    actor,
    action: "SUBMIT",
    caseId,
    stage,
    oldStatus: assessmentCase.status,
    newStatus: updated.status,
    metadata: { submissionId: submission.submissionId },
  });
  return { submission, case: updated };
}

export function finalizeCase(
  actor: ActorContext,
  caseId: string,
  input: {
    answers: Record<string, unknown>;
    decisionNote: string;
    conflictDeclared: boolean;
    expectedVersion: number;
    idempotencyKey: string;
    performanceScore?: number;
    potentialScore?: number;
  },
) {
  const existing = memoryRepository.findSubmissionByIdempotency(input.idempotencyKey);
  if (existing) {
    return {
      submission: existing,
      case: memoryRepository.getCase(caseId)!,
      finalResult: memoryRepository.getFinalResult(caseId),
    };
  }

  const assessmentCase = memoryRepository.getCase(caseId);
  if (!assessmentCase) throw Object.assign(new Error("ไม่พบเคส"), { code: "NOT_FOUND" });
  if (assessmentCase.version !== input.expectedVersion) {
    throw Object.assign(new Error("มีการแก้ไขพร้อมกัน กรุณารีเฟรช"), {
      code: "CONFLICT",
    });
  }

  const committeeAssignments = memoryRepository.getCommitteeAssignments(caseId);
  if (input.conflictDeclared) {
    const assignment = committeeAssignments.find(
      (a) => a.reviewerUserId === actor.user.userId,
    );
    if (assignment) {
      assignment.status = "RECUSED";
      assignment.conflictDeclaredAt = new Date().toISOString();
    }
    writeAudit({
      actor,
      action: "RECUSE",
      caseId,
      stage: "COMMITTEE",
      oldStatus: assessmentCase.status,
      newStatus: assessmentCase.status,
    });
    throw new PermissionError("บันทึกการถอนตัวแล้ว ไม่สามารถสรุปผลได้");
  }

  assertCan("finalize", actor, { assessmentCase, committeeAssignments });

  const form = memoryRepository.getFormVersion(assessmentCase.committeeFormVersionId);
  if (!form?.frozenAt) throw new Error("แบบฟอร์มยังไม่ถูกแช่แข็ง");
  const issues = validateAnswers(form.schemaJson, input.answers);
  if (issues.length) {
    throw Object.assign(new Error("คำตอบไม่ครบหรือไม่ถูกต้อง"), {
      code: "VALIDATION",
      details: issues,
    });
  }

  const score = computeScore(form.schemaJson, input.answers, form.scoringConfigJson);
  const next = assertTransition(
    assessmentCase.status,
    "FINALIZE",
    activeRoles(actor.roles),
  );

  const submission = {
    submissionId: newId(),
    caseId,
    stage: "COMMITTEE" as const,
    evaluatorUserId: actor.user.userId,
    scoreJson: score,
    answersJson: input.answers,
    submittedAt: new Date().toISOString(),
    revision: 1,
    idempotencyKey: input.idempotencyKey,
  };
  memoryRepository.addSubmission(submission);

  const finalResult = {
    caseId,
    cycleId: assessmentCase.cycleId,
    finalScore: score.overall,
    performanceScore: input.performanceScore ?? score.byDimension.performance ?? score.overall,
    potentialScore: input.potentialScore ?? score.byDimension.potential ?? null,
    talentSegment: null,
    decisionNote: input.decisionNote,
    finalizedAt: new Date().toISOString(),
    publishedAt: null,
    resultVersion: 1,
  };
  memoryRepository.addFinalResult(finalResult);
  const updated = memoryRepository.updateCase(caseId, { status: next });
  writeAudit({
    actor,
    action: "FINALIZE",
    caseId,
    stage: "COMMITTEE",
    oldStatus: assessmentCase.status,
    newStatus: updated.status,
  });
  return { submission, case: updated, finalResult };
}

export function publishCase(actor: ActorContext, caseId: string) {
  const assessmentCase = memoryRepository.getCase(caseId);
  if (!assessmentCase) throw Object.assign(new Error("ไม่พบเคส"), { code: "NOT_FOUND" });
  assertCan("publish", actor, { assessmentCase });
  const next = assertTransition(
    assessmentCase.status,
    "PUBLISH",
    activeRoles(actor.roles),
  );
  const result = memoryRepository.getFinalResult(caseId);
  if (!result) throw new Error("ยังไม่มีผลสรุป");
  result.publishedAt = new Date().toISOString();
  memoryRepository.addFinalResult(result);
  const updated = memoryRepository.updateCase(caseId, { status: next });
  writeAudit({
    actor,
    action: "PUBLISH",
    caseId,
    oldStatus: assessmentCase.status,
    newStatus: updated.status,
  });
  return updated;
}
