import { AppShell } from "@/components/layout/AppShell";
import { CommitteeFinalizeClient } from "@/components/assessment/CommitteeFinalizeClient";
import { getShellData } from "@/lib/auth/server-data";
import { getCaseForActor } from "@/lib/services/cases";
import { memoryRepository } from "@/lib/repository/memory";

export default async function CommitteeCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const { user, roles, actor } = await getShellData();
  const data = getCaseForActor(actor, caseId);
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
