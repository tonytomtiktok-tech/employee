import { describe, expect, it, beforeEach } from "vitest";
import { assertCan, PermissionError } from "@/lib/permissions/policy";
import { memoryRepository, resetStore } from "@/lib/repository/memory";
import type { ActorContext } from "@/types";

function actorFor(email: string): ActorContext {
  const user = memoryRepository.findUserByEmail(email)!;
  return {
    user,
    roles: memoryRepository.getRoleAssignments(user.userId),
    memberships: memoryRepository.getMemberships(user.userId),
  };
}

describe("permissions", () => {
  beforeEach(() => resetStore());

  it("employee can only read own case", () => {
    const employee = actorFor("emp016@demo.local");
    const own = memoryRepository.listCasesForEmployee(employee.user.userId)[0];
    expect(() =>
      assertCan("read_own_case", employee, { assessmentCase: own }),
    ).not.toThrow();

    const other = memoryRepository
      .getStore()
      .cases.find((c) => c.employeeUserId !== employee.user.userId)!;
    expect(() =>
      assertCan("read_own_case", employee, { assessmentCase: other }),
    ).toThrow(PermissionError);
  });

  it("non-assigned manager cannot read case", () => {
    const manager = actorFor("emp001@demo.local");
    const foreign = memoryRepository
      .getStore()
      .cases.find((c) => c.managerUserId !== manager.user.userId)!;
    expect(() =>
      assertCan("read_manager_case", manager, { assessmentCase: foreign }),
    ).toThrow(PermissionError);
  });

  it("committee without assignment is denied", () => {
    const committee = actorFor("emp009@demo.local");
    const unassigned = memoryRepository
      .getStore()
      .cases.find(
        (c) =>
          !memoryRepository
            .getCommitteeAssignments(c.caseId)
            .some((a) => a.reviewerUserId === committee.user.userId),
      );
    if (!unassigned) return;
    expect(() =>
      assertCan("read_committee_case", committee, {
        assessmentCase: unassigned,
        committeeAssignments: memoryRepository.getCommitteeAssignments(
          unassigned.caseId,
        ),
      }),
    ).toThrow(PermissionError);
  });
});
