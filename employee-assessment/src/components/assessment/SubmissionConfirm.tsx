"use client";

import { Button } from "@/components/ui/button";

export function SubmissionConfirm({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  busy,
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            ยกเลิก
          </Button>
          <Button onClick={onConfirm} disabled={busy}>
            {busy ? "กำลังส่ง..." : "ยืนยันส่ง"}
          </Button>
        </div>
      </div>
    </div>
  );
}
