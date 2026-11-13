export function ScoreDistribution({
  distribution,
  masked,
  N,
}: {
  distribution: { score: number; count: number }[];
  masked: boolean;
  N: number;
}) {
  if (masked) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
        ซ่อนการกระจายคะแนนเนื่องจาก N = {N} ต่ำกว่าเกณฑ์ความเป็นส่วนตัว
      </div>
    );
  }
  const max = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="font-display text-base font-semibold">
        การกระจายคะแนนที่เผยแพร่แล้ว
      </h3>
      <p className="mt-1 text-xs text-muted">N = {N} · ใช้เฉพาะผล PUBLISHED</p>
      <div className="mt-4 space-y-2">
        {distribution.map((d) => (
          <div key={d.score} className="flex items-center gap-3 text-sm">
            <span className="w-8">{d.score}</span>
            <div className="h-3 flex-1 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-accent"
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-muted">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
