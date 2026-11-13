import { describe, expect, it, beforeEach } from "vitest";
import { memoryRepository, resetStore } from "@/lib/repository/memory";
import { saveDraft, submitStage } from "@/lib/services/cases";
import type { ActorContext } from "@/types";

function actorFor(email: string): ActorContext {
  const user = memoryRepository.findUserByEmail(email)!;
  return {
    user,
    roles: memoryRepository.getRoleAssignments(user.userId),
    memberships: memoryRepository.getMemberships(user.userId),
  };
}

describe("concurrency and idempotency", () => {
  beforeEach(() => resetStore());

  it("rejects stale expectedVersion on draft save", () => {
    const actor = actorFor("emp016@demo.local");
    const c = memoryRepository.listCasesForEmployee(actor.user.userId)[0];
    expect(() =>
      saveDraft(actor, c.caseId, "SELF", { s01: 3 }, c.version + 5),
    ).toThrow(/พร้อมกัน/);
  });

  it("duplicate submit with same idempotency key returns same submission", () => {
    const actor = actorFor("emp050@demo.local");
    const c = memoryRepository.listCasesForEmployee(actor.user.userId)[0];
    const answers = {
      s01: 4,
      s02: 4,
      s03: 4,
      s04: 4,
      s05: "proud work",
      s06: ["ภาวะผู้นำ"],
    };
    const key = "idem-test-key-001";
    const first = submitStage(actor, c.caseId, "SELF", answers, c.version, key);
    const second = submitStage(
      actor,
      c.caseId,
      "SELF",
      answers,
      first.case.version,
      key,
    );
    expect(second.submission.submissionId).toBe(first.submission.submissionId);
  });
});
