"use client";

import { cn } from "@/lib/utils/cn";

const LABELS = ["ควรปรับปรุง", "พอใช้", "ดี", "ดีมาก", "ดีเยี่ยม"];

export function RatingQuestion({
  id,
  label,
  value,
  min = 1,
  max = 5,
  required,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value?: number;
  min?: number;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </legend>
      <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-labelledby={id}>
        {options.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={cn(
              "rounded-xl border px-2 py-3 text-center transition",
              value === n
                ? "border-accent bg-accent-soft text-accent"
                : "border-border bg-white hover:border-accent/40",
            )}
          >
            <div className="text-lg font-semibold">{n}</div>
            <div className="mt-1 text-[10px] leading-tight text-muted">
              {LABELS[n - 1]}
            </div>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
