export function CommitteeDecision({
  selfAnswers,
  managerAnswers,
}: {
  selfAnswers?: Record<string, unknown>;
  managerAnswers?: Record<string, unknown>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Self" answers={selfAnswers} />
      <Panel title="Manager" answers={managerAnswers} />
    </div>
  );
}

function Panel({
  title,
  answers,
}: {
  title: string;
  answers?: Record<string, unknown>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      <div className="mt-3 max-h-80 space-y-2 overflow-auto">
        {answers && Object.keys(answers).length > 0 ? (
          Object.entries(answers).map(([k, v]) => (
            <div key={k} className="text-sm">
              <span className="text-xs text-muted">{k}: </span>
              {Array.isArray(v) ? v.join(", ") : String(v)}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">ยังไม่มีข้อมูล</p>
        )}
      </div>
    </div>
  );
}
