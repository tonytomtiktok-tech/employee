"use client";

import { useMemo, useState } from "react";
import type { AssessmentCase, FormSchema, Stage } from "@/types";
import { FormRenderer } from "./FormRenderer";
import { FormStepper } from "./FormStepper";
import { SubmissionConfirm } from "./SubmissionConfirm";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { isDraftWritable } from "@/lib/workflow/states";
import { saveDraft as saveDraftService, submitStage } from "@/lib/services/cases";
import { useApp } from "@/components/providers/AppProvider";
import { newId } from "@/lib/utils/id";

export function AssessmentFormClient({
  assessmentCase,
  schema,
  stage,
  initialAnswers,
  employeeName,
  cycleName,
  deadline,
  extraTop,
}: {
  assessmentCase: AssessmentCase;
  schema: FormSchema;
  stage: Stage;
  initialAnswers: Record<string, unknown>;
  employeeName: string;
  cycleName: string;
  deadline?: string;
  extraTop?: React.ReactNode;
}) {
  const { actor, refresh } = useApp();
  const [answers, setAnswers] = useState(initialAnswers);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [status, setStatus] = useState(assessmentCase.status);
  const [version, setVersion] = useState(assessmentCase.version);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const readOnly = !isDraftWritable(status, stage);

  const remainingBySection = useMemo(() => {
    const map: Record<string, number> = {};
    for (const section of schema.sections) {
      map[section.id] = section.questions.filter((q) => {
        if (!q.required) return false;
        const v = answers[q.id];
        return (
          v === undefined ||
          v === null ||
          v === "" ||
          (Array.isArray(v) && v.length === 0)
        );
      }).length;
    }
    return map;
  }, [schema, answers]);

  function saveDraft() {
    setSaveState("saving");
    try {
      const updated = saveDraftService(
        actor,
        assessmentCase.caseId,
        stage,
        answers,
        version,
      );
      setStatus(updated.status);
      setVersion(updated.version);
      setSaveState("saved");
      refresh();
    } catch (e) {
      setSaveState("error");
      setMessage(e instanceof Error ? e.message : "บันทึกร่างไม่สำเร็จ");
    }
  }

  function submit() {
    setBusy(true);
    try {
      const result = submitStage(
        actor,
        assessmentCase.caseId,
        stage,
        answers,
        version,
        newId(),
      );
      setStatus(result.case.status);
      setVersion(result.case.version);
      setMessage(`ส่งสำเร็จ รหัสใบรับ: ${result.submission.submissionId}`);
      refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "ส่งไม่สำเร็จ");
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">{cycleName}</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {schema.title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {employeeName}
            {deadline
              ? ` · กำหนดส่ง ${new Date(deadline).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <span className="text-xs text-muted">
            {saveState === "saving"
              ? "กำลังบันทึก..."
              : saveState === "saved"
                ? "บันทึกร่างแล้ว"
                : saveState === "error"
                  ? "บันทึกล้มเหลว"
                  : "พร้อมแก้ไข"}
          </span>
        </div>
      </header>

      {extraTop}

      {message ? (
        <div className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <FormStepper
          sections={schema.sections}
          current={sectionIndex}
          onSelect={setSectionIndex}
          remainingBySection={remainingBySection}
        />
        <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
          <FormRenderer
            schema={schema}
            sectionIndex={sectionIndex}
            answers={answers}
            disabled={readOnly}
            onChange={(qid, value) =>
              setAnswers((prev) => ({ ...prev, [qid]: value }))
            }
          />
          <div className="mt-8 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={sectionIndex === 0}
              onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
            >
              ก่อนหน้า
            </Button>
            <Button
              variant="secondary"
              disabled={sectionIndex >= schema.sections.length - 1}
              onClick={() =>
                setSectionIndex((i) =>
                  Math.min(schema.sections.length - 1, i + 1),
                )
              }
            >
              ถัดไป
            </Button>
            <div className="flex-1" />
            {!readOnly ? (
              <>
                <Button variant="secondary" onClick={saveDraft}>
                  บันทึกร่าง
                </Button>
                {stage !== "COMMITTEE" ? (
                  <Button onClick={() => setConfirmOpen(true)}>ส่งแบบประเมิน</Button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <SubmissionConfirm
        open={confirmOpen}
        title="ยืนยันการส่งแบบประเมิน"
        description="หลังส่งแล้วจะไม่สามารถแก้ไขได้จนกว่า HR หรือผู้มีสิทธิ์จะส่งกลับ"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
        busy={busy}
      />
    </div>
  );
}
