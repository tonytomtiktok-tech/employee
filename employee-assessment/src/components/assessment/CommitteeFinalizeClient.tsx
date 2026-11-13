"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AssessmentCase, FormSchema } from "@/types";
import { FormRenderer } from "./FormRenderer";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { CommitteeDecision } from "@/components/review/CommitteeDecision";

export function CommitteeFinalizeClient({
  assessmentCase,
  schema,
  selfAnswers,
  managerAnswers,
  employeeName,
  cycleName,
}: {
  assessmentCase: AssessmentCase;
  schema: FormSchema;
  selfAnswers?: Record<string, unknown>;
  managerAnswers?: Record<string, unknown>;
  employeeName: string;
  cycleName: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [note, setNote] = useState("");
  const [conflict, setConflict] = useState(false);
  const [version] = useState(assessmentCase.version);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function finalize() {
    setBusy(true);
    const res = await fetch(`/api/cases/${assessmentCase.caseId}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        decisionNote: note || "สรุปโดยกรรมการ",
        conflictDeclared: conflict,
        expectedVersion: version,
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error ?? "สรุปผลไม่สำเร็จ");
      return;
    }
    setMessage("สรุปผลสำเร็จ รอ HR เผยแพร่");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
        <div>
          <p className="text-sm text-muted">{cycleName}</p>
          <h1 className="font-display text-2xl font-semibold">{schema.title}</h1>
          <p className="mt-1 text-sm text-muted">{employeeName}</p>
        </div>
        <StatusBadge status={assessmentCase.status} />
      </header>

      <CommitteeDecision selfAnswers={selfAnswers} managerAnswers={managerAnswers} />

      <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        <FormRenderer
          schema={schema}
          sectionIndex={0}
          answers={answers}
          onChange={(id, value) => setAnswers((p) => ({ ...p, [id]: value }))}
        />
        {schema.sections[1] ? (
          <div className="mt-6">
            <FormRenderer
              schema={schema}
              sectionIndex={1}
              answers={answers}
              onChange={(id, value) => setAnswers((p) => ({ ...p, [id]: value }))}
            />
          </div>
        ) : null}

        <label className="mt-6 block space-y-2 text-sm">
          <span className="font-medium">บันทึกการตัดสินใจ</span>
          <textarea
            className="min-h-24 w-full rounded-xl border border-border px-3 py-2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={conflict}
            onChange={(e) => setConflict(e.target.checked)}
          />
          ประกาศความขัดแย้งทางผลประโยชน์และถอนตัว
        </label>

        <div className="mt-6">
          <Button onClick={finalize} disabled={busy}>
            {busy ? "กำลังบันทึก..." : "สรุปผลขั้นสุดท้าย"}
          </Button>
        </div>
        {message ? <p className="mt-3 text-sm text-accent">{message}</p> : null}
      </div>
    </div>
  );
}
