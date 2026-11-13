import type { FormSchema } from "@/types";

export function SelfComparison({
  schema,
  selfAnswers,
  managerAnswers,
}: {
  schema: FormSchema;
  selfAnswers?: Record<string, unknown>;
  managerAnswers?: Record<string, unknown>;
}) {
  const ratingQuestions = schema.sections
    .flatMap((s) => s.questions)
    .filter((q) => q.type === "rating" && q.dimension);

  return (
    <div className="space-y-3">
      <h3 className="font-display text-base font-semibold">เปรียบเทียบมิติคะแนน</h3>
      <p className="text-xs text-muted">
        แสดงเพื่อประกอบการพิจารณา ไม่บังคับให้คะแนนตรงกัน
      </p>
      {ratingQuestions.map((q) => {
        const self = selfAnswers?.[q.id];
        const mgr = managerAnswers?.[q.id];
        return (
          <div
            key={q.id}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            <span>{q.label}</span>
            <span className="text-muted">ตน: {String(self ?? "—")}</span>
            <span className="text-accent">หัวหน้า: {String(mgr ?? "—")}</span>
          </div>
        );
      })}
    </div>
  );
}
