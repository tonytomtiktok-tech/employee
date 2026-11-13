import { describe, expect, it } from "vitest";
import { canTransition, assertTransition } from "@/lib/workflow/transitions";

describe("workflow transitions", () => {
  it("blocks manager submit before self submit", () => {
    expect(canTransition("SELF_DRAFT", "SUBMIT_MANAGER", "MANAGER")).toBeNull();
  });

  it("allows self submit from draft", () => {
    expect(canTransition("SELF_DRAFT", "SUBMIT_SELF", "EMPLOYEE")).toBe(
      "SELF_SUBMITTED",
    );
  });

  it("only HR can publish finalized cases", () => {
    expect(canTransition("FINALIZED", "PUBLISH", "COMMITTEE")).toBeNull();
    expect(canTransition("FINALIZED", "PUBLISH", "HR_ADMIN")).toBe("PUBLISHED");
  });

  it("assertTransition throws on illegal stage skip", () => {
    expect(() =>
      assertTransition("NOT_STARTED", "FINALIZE", ["COMMITTEE"]),
    ).toThrow();
  });
});
