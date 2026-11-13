"use client";

export function TextQuestion({
  label,
  value,
  required,
  maxLength = 3000,
  disabled,
  onChange,
}: {
  label: string;
  value?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const len = value?.length ?? 0;
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <textarea
        className="min-h-28 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none ring-accent focus:ring-2 disabled:bg-slate-50"
        value={value ?? ""}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="block text-right text-xs text-muted">
        {len}/{maxLength}
      </span>
    </label>
  );
}
