import type { FormSchema, ScoreSnapshot, ScoringConfig } from "@/types";

export function computeScore(
  schema: FormSchema,
  answers: Record<string, unknown>,
  config: ScoringConfig = {
    method: "weighted_mean",
    missingRequiredBlocksSubmit: true,
    notApplicablePolicy: "exclude",
  },
): ScoreSnapshot {
  void config;
  const byDimension: Record<string, { sum: number; weight: number }> = {};
  let totalSum = 0;
  let totalWeight = 0;
  let answeredCount = 0;
  let requiredCount = 0;

  for (const section of schema.sections) {
    for (const q of section.questions) {
      if (q.required) requiredCount += 1;
      if (q.type !== "rating" && q.type !== "number") continue;
      if (q.weight == null) continue;

      const raw = answers[q.id];
      if (typeof raw !== "number") continue;

      answeredCount += 1;
      const weight = q.weight;
      totalSum += raw * weight;
      totalWeight += weight;

      const dim = q.dimension ?? "general";
      if (!byDimension[dim]) byDimension[dim] = { sum: 0, weight: 0 };
      byDimension[dim].sum += raw * weight;
      byDimension[dim].weight += weight;
    }
  }

  const dimensionScores: Record<string, number> = {};
  for (const [dim, agg] of Object.entries(byDimension)) {
    dimensionScores[dim] = agg.weight > 0 ? round2(agg.sum / agg.weight) : 0;
  }

  return {
    overall: totalWeight > 0 ? round2(totalSum / totalWeight) : null,
    byDimension: dimensionScores,
    answeredCount,
    requiredCount,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
