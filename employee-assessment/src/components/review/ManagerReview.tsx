export function ManagerReview({
  selfAnswers,
}: {
  selfAnswers?: Record<string, unknown>;
}) {
  if (!selfAnswers || Object.keys(selfAnswers).length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
        ยังไม่มีคำตอบจากพนักงาน หรือยังไม่อยู่ในสถานะที่อ่านได้
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <h3 className="font-display text-base font-semibold">
        ประเมินตนเองของพนักงาน (อ่านอย่างเดียว)
      </h3>
      {Object.entries(selfAnswers).map(([key, value]) => (
        <div key={key} className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm">
          <div className="text-xs text-muted">{key}</div>
          <div className="mt-1 whitespace-pre-wrap">
            {Array.isArray(value) ? value.join(", ") : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
}
