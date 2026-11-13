import type { FormQuestion, FormSchema } from "@/types";

export interface ValidationIssue {
  questionId: string;
  message: string;
}

export function validateAnswers(
  schema: FormSchema,
  answers: Record<string, unknown>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const section of schema.sections) {
    for (const q of section.questions) {
      const value = answers[q.id];
      const missing =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (q.required && missing) {
        issues.push({ questionId: q.id, message: "จำเป็นต้องตอบคำถามนี้" });
        continue;
      }
      if (missing) continue;

      const typeIssue = validateByType(q, value);
      if (typeIssue) issues.push(typeIssue);
    }
  }
  return issues;
}

function validateByType(q: FormQuestion, value: unknown): ValidationIssue | null {
  switch (q.type) {
    case "rating":
    case "number": {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return { questionId: q.id, message: "ต้องเป็นตัวเลข" };
      }
      if (q.min != null && value < q.min) {
        return { questionId: q.id, message: `ต้องไม่น้อยกว่า ${q.min}` };
      }
      if (q.max != null && value > q.max) {
        return { questionId: q.id, message: `ต้องไม่เกิน ${q.max}` };
      }
      return null;
    }
    case "textarea": {
      if (typeof value !== "string") {
        return { questionId: q.id, message: "ต้องเป็นข้อความ" };
      }
      if (q.maxLength && value.length > q.maxLength) {
        return {
          questionId: q.id,
          message: `ยาวเกิน ${q.maxLength} ตัวอักษร`,
        };
      }
      return null;
    }
    case "single_select": {
      if (typeof value !== "string" || !q.options?.includes(value)) {
        return { questionId: q.id, message: "ตัวเลือกไม่ถูกต้อง" };
      }
      return null;
    }
    case "multi_select": {
      if (
        !Array.isArray(value) ||
        value.some((v) => typeof v !== "string" || !q.options?.includes(v))
      ) {
        return { questionId: q.id, message: "ตัวเลือกไม่ถูกต้อง" };
      }
      return null;
    }
    case "date": {
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        return { questionId: q.id, message: "วันที่ไม่ถูกต้อง" };
      }
      return null;
    }
    default:
      return null;
  }
}
