export function TrendChart() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="font-display text-base font-semibold">แนวโน้มข้ามรอบ</h3>
      <p className="mt-1 text-xs text-muted">
        ต้องมีรอบที่ใช้ rubric เดียวกัน — จะเปิดเมื่อมีข้อมูลหลายรอบ
      </p>
      <div className="mt-6 flex h-32 items-end gap-2">
        {[40, 55, 48, 62, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-accent/30"
            style={{ height: `${h}%` }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
