export function TalentMatrix() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="font-display text-base font-semibold">9-box (ตัวอย่าง)</h3>
      <p className="mt-1 text-xs text-muted">
        ใช้ได้เมื่อ performance และ potential ถูกประเมินแยกตามเกณฑ์ที่อนุมัติ
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-lg bg-accent-soft/60 text-xs text-accent"
          >
            —
          </div>
        ))}
      </div>
    </div>
  );
}
