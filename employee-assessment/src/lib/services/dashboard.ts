import { assertCan } from "@/lib/permissions/policy";
import { suppressSmallN, PRIVACY_THRESHOLD } from "@/lib/permissions/scopes";
import { memoryRepository } from "@/lib/repository/memory";
import type { ActorContext } from "@/types";

export function getDashboardSummary(
  actor: ActorContext,
  cycleId: string,
  scopeOrgUnitId?: string,
) {
  assertCan("read_dashboard_aggregate", actor);

  const allCases = memoryRepository
    .getStore()
    .cases.filter((c) => c.cycleId === cycleId);
  const memberships = memoryRepository.getStore().memberships;
  const scopedEmployeeIds = new Set(
    scopeOrgUnitId
      ? memberships
          .filter((m) => m.orgUnitId === scopeOrgUnitId || scopeMatchesParent(m.orgUnitId, scopeOrgUnitId))
          .map((m) => m.userId)
      : memberships.map((m) => m.userId),
  );

  const cases = allCases.filter((c) => scopedEmployeeIds.has(c.employeeUserId));
  const published = memoryRepository
    .listPublishedResults(cycleId)
    .filter((r) => cases.some((c) => c.caseId === r.caseId));

  const scores = published
    .map((p) => p.finalScore)
    .filter((s): s is number => s != null);

  const mean =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      : null;
  const sorted = [...scores].sort((a, b) => a - b);
  const median =
    sorted.length === 0
      ? null
      : sorted.length % 2 === 1
        ? sorted[(sorted.length - 1) / 2]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

  const n = published.length;
  const masked = suppressSmallN(n);

  return {
    cycleId,
    scopeOrgUnitId: scopeOrgUnitId ?? null,
    privacyThreshold: PRIVACY_THRESHOLD,
    totals: {
      employeesInScope: cases.length,
      selfSubmitted: cases.filter((c) =>
        [
          "SELF_SUBMITTED",
          "MANAGER_DRAFT",
          "MANAGER_SUBMITTED",
          "COMMITTEE_IN_REVIEW",
          "FINALIZED",
          "PUBLISHED",
        ].includes(c.status),
      ).length,
      managerSubmitted: cases.filter((c) =>
        [
          "MANAGER_SUBMITTED",
          "COMMITTEE_IN_REVIEW",
          "FINALIZED",
          "PUBLISHED",
        ].includes(c.status),
      ).length,
      finalized: cases.filter((c) =>
        ["FINALIZED", "PUBLISHED"].includes(c.status),
      ).length,
      published: n,
      overdue: 0,
    },
    publishedOnly: true,
    metrics: masked
      ? {
          masked: true,
          reason: `กลุ่มมี N < ${PRIVACY_THRESHOLD}`,
          mean: null,
          median: null,
          distribution: [],
          N: n,
        }
      : {
          masked: false,
          mean,
          median,
          distribution: buildDistribution(scores),
          N: n,
        },
  };
}

export function getDashboardDrilldown(
  actor: ActorContext,
  cycleId: string,
  scopeOrgUnitId?: string,
) {
  assertCan("read_dashboard_identifiable", actor);
  const summary = getDashboardSummary(actor, cycleId, scopeOrgUnitId);
  if (summary.metrics.masked) {
    return { ...summary, people: [] as never[] };
  }

  const results = memoryRepository.listPublishedResults(cycleId);
  const people = results.map((r) => {
    const c = memoryRepository.getCase(r.caseId)!;
    const user = memoryRepository.findUserById(c.employeeUserId)!;
    return {
      caseId: r.caseId,
      employeeCode: user.employeeCode,
      displayName: user.displayName,
      finalScore: r.finalScore,
      talentSegment: r.talentSegment,
      publishedAt: r.publishedAt,
    };
  });

  return { ...summary, people };
}

function buildDistribution(scores: number[]) {
  const buckets = [1, 2, 3, 4, 5].map((b) => ({
    score: b,
    count: scores.filter((s) => Math.round(s) === b).length,
  }));
  return buckets;
}

function scopeMatchesParent(orgUnitId: string, parentId: string): boolean {
  let current = memoryRepository.getOrgUnit(orgUnitId);
  while (current?.parentId) {
    if (current.parentId === parentId) return true;
    current = memoryRepository.getOrgUnit(current.parentId);
  }
  return false;
}
