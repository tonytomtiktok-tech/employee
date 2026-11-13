import { describe, expect, it } from "vitest";
import { computeScore } from "@/lib/forms/scoring";
import { validateAnswers } from "@/lib/forms/validator";
import selfForm from "@/config/mock-forms/self.json";
import type { FormSchema } from "@/types";

const schema = selfForm as FormSchema;

describe("scoring and validation", () => {
  it("computes weighted mean of rating answers", () => {
    const score = computeScore(schema, {
      s01: 4,
      s02: 5,
      s03: 3,
      s04: 4,
      s05: "ผลงานตัวอย่าง",
      s06: ["การสื่อสาร"],
    });
    expect(score.overall).toBe(4);
    expect(score.byDimension.performance).toBe(4);
  });

  it("blocks submit when required answers missing", () => {
    const issues = validateAnswers(schema, { s01: 3 });
    expect(issues.some((i) => i.questionId === "s02")).toBe(true);
  });
});
