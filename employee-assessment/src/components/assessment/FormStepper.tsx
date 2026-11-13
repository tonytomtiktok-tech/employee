"use client";

import { cn } from "@/lib/utils/cn";
import type { FormSection } from "@/types";

export function FormStepper({
  sections,
  current,
  onSelect,
  remainingBySection,
}: {
  sections: FormSection[];
  current: number;
  onSelect: (index: number) => void;
  remainingBySection: Record<string, number>;
}) {
  return (
    <ol className="space-y-2">
      {sections.map((section, index) => {
        const remaining = remainingBySection[section.id] ?? 0;
        return (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "w-full rounded-xl border px-3 py-3 text-left transition",
                index === current
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-white hover:border-accent/30",
              )}
            >
              <div className="text-sm font-medium">{section.title}</div>
              <div className="mt-1 text-xs text-muted">
                {remaining > 0
                  ? `เหลือคำถามบังคับ ${remaining} ข้อ`
                  : "ครบแล้ว"}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
