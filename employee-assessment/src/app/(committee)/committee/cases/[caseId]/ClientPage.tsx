"use client";

import { AppShell } from "@/components/layout/AppShell";
import { CommitteeFinalizeClient } from "@/components/assessment/CommitteeFinalizeClient";
import { useApp } from "@/components/providers/AppProvider";
import { getCaseForActor } from "@/lib/services/cases";
import { memoryRepository } from "@/lib/repository/memory";

export default function ClientPage({ caseId }: { caseId: string }) {
  const { user, roles, actor } = useApp();

  let data;
  try {
    data = getCaseForActor(actor, caseId);
  } catch {
    return (
      <AppShell user={user} roles={roles}>
        <p className="text-sm text-muted">ไม่พบเคสหรือไม่มีสิทธิ์เข้าถึง</p>
      </AppShell>
    );
  }

  const form = memoryRepository.getFormVersion(data.case.committeeFormVersionId)!;
  const cycle = memoryRepository.getCurrentCycle();

  return (
    <AppShell user={user} roles={roles}>
      <CommitteeFinalizeClient
        assessmentCase={data.case}
        schema={form.schemaJson}
        selfAnswers={data.selfAnswers}
        managerAnswers={data.managerAnswers}
        employeeName={data.employee?.displayName ?? ""}
        cycleName={cycle?.name ?? ""}
      />
    </AppShell>
  );
}
