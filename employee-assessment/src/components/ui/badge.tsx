import { cn } from "@/lib/utils/cn";
import type { CaseStatus } from "@/types";
import { STATUS_COLORS, STATUS_LABELS_TH } from "@/lib/workflow/states";

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_COLORS[status],
      )}
      aria-label={STATUS_LABELS_TH[status]}
    >
      {STATUS_LABELS_TH[status]}
    </span>
  );
}
