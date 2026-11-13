"use client";

import type { FormQuestion, FormSchema } from "@/types";
import { RatingQuestion } from "./RatingQuestion";
import { TextQuestion } from "./TextQuestion";

export function FormRenderer({
  schema,
  sectionIndex,
  answers,
  disabled,
  onChange,
}: {
  schema: FormSchema;
  sectionIndex: number;
  answers: Record<string, unknown>;
  disabled?: boolean;
  onChange: (questionId: string, value: unknown) => void;
}) {
  const section = schema.sections[sectionIndex];
  if (!section) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">{section.title}</h2>
        <p className="mt-1 text-sm text-muted">
          ส่วนที่ {sectionIndex + 1} จาก {schema.sections.length}
        </p>
      </div>
      {section.questions.map((q) => (
        <QuestionField
          key={q.id}
          question={q}
          value={answers[q.id]}
          disabled={disabled}
          onChange={(v) => onChange(q.id, v)}
        />
      ))}
    </div>
  );
}

function QuestionField({
  question,
  value,
  disabled,
  onChange,
}: {
  question: FormQuestion;
  value: unknown;
  disabled?: boolean;
  onChange: (v: unknown) => void;
}) {
  if (question.type === "rating") {
    return (
      <RatingQuestion
        id={question.id}
        label={question.label}
        value={typeof value === "number" ? value : undefined}
        min={question.min}
        max={question.max}
        required={question.required}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  if (question.type === "textarea") {
    return (
      <TextQuestion
        label={question.label}
        value={typeof value === "string" ? value : ""}
        required={question.required}
        maxLength={question.maxLength}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  if (question.type === "multi_select") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <fieldset disabled={disabled} className="space-y-2">
        <legend className="text-sm font-medium">
          {question.label}
          {question.required ? <span className="text-danger"> *</span> : null}
        </legend>
        <div className="space-y-2">
          {question.options?.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <label
                key={opt}
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    onChange(
                      checked
                        ? selected.filter((x) => x !== opt)
                        : [...selected, opt],
                    );
                  }}
                />
                {opt}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }
  if (question.type === "single_select") {
    return (
      <label className="block space-y-2 text-sm">
        <span className="font-medium">
          {question.label}
          {question.required ? <span className="text-danger"> *</span> : null}
        </span>
        <select
          className="w-full rounded-xl border border-border bg-white px-3 py-2"
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">เลือก...</option>
          {question.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return null;
}
