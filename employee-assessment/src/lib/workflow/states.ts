import type { CaseStatus, Stage } from "@/types";

export const CASE_STATUSES: CaseStatus[] = [
  "NOT_STARTED",
  "SELF_DRAFT",
  "SELF_SUBMITTED",
  "MANAGER_DRAFT",
  "MANAGER_SUBMITTED",
  "COMMITTEE_IN_REVIEW",
  "FINALIZED",
  "PUBLISHED",
  "RETURNED_TO_SELF",
  "RETURNED_TO_MANAGER",
  "CANCELLED",
  "REOPENED_BY_HR",
];

export const STATUS_LABELS_TH: Record<CaseStatus, string> = {
  NOT_STARTED: "ยังไม่เริ่ม",
  SELF_DRAFT: "ร่างประเมินตนเอง",
  SELF_SUBMITTED: "ส่งประเมินตนเองแล้ว",
  MANAGER_DRAFT: "หัวหน้าร่างประเมิน",
  MANAGER_SUBMITTED: "หัวหน้าส่งแล้ว",
  COMMITTEE_IN_REVIEW: "กรรมการกำลังพิจารณา",
  FINALIZED: "สรุปผลแล้ว",
  PUBLISHED: "เผยแพร่แล้ว",
  RETURNED_TO_SELF: "ส่งกลับให้พนักงาน",
  RETURNED_TO_MANAGER: "ส่งกลับให้หัวหน้า",
  CANCELLED: "ยกเลิก",
  REOPENED_BY_HR: "HR เปิดใหม่",
};

export const STATUS_COLORS: Record<CaseStatus, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-700",
  SELF_DRAFT: "bg-amber-100 text-amber-800",
  SELF_SUBMITTED: "bg-sky-100 text-sky-800",
  MANAGER_DRAFT: "bg-indigo-100 text-indigo-800",
  MANAGER_SUBMITTED: "bg-violet-100 text-violet-800",
  COMMITTEE_IN_REVIEW: "bg-fuchsia-100 text-fuchsia-800",
  FINALIZED: "bg-teal-100 text-teal-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  RETURNED_TO_SELF: "bg-orange-100 text-orange-800",
  RETURNED_TO_MANAGER: "bg-orange-100 text-orange-800",
  CANCELLED: "bg-rose-100 text-rose-800",
  REOPENED_BY_HR: "bg-yellow-100 text-yellow-800",
};

export function stageForStatus(status: CaseStatus): Stage | null {
  switch (status) {
    case "NOT_STARTED":
    case "SELF_DRAFT":
    case "RETURNED_TO_SELF":
    case "REOPENED_BY_HR":
      return "SELF";
    case "SELF_SUBMITTED":
    case "MANAGER_DRAFT":
    case "RETURNED_TO_MANAGER":
      return "MANAGER";
    case "MANAGER_SUBMITTED":
    case "COMMITTEE_IN_REVIEW":
      return "COMMITTEE";
    default:
      return null;
  }
}

export function isDraftWritable(status: CaseStatus, stage: Stage): boolean {
  if (stage === "SELF") {
    return ["NOT_STARTED", "SELF_DRAFT", "RETURNED_TO_SELF", "REOPENED_BY_HR"].includes(
      status,
    );
  }
  if (stage === "MANAGER") {
    return ["SELF_SUBMITTED", "MANAGER_DRAFT", "RETURNED_TO_MANAGER"].includes(status);
  }
  if (stage === "COMMITTEE") {
    return ["MANAGER_SUBMITTED", "COMMITTEE_IN_REVIEW"].includes(status);
  }
  return false;
}

export function isPublishedOnly(status: CaseStatus): boolean {
  return status === "PUBLISHED";
}
