import { AppShell } from "@/components/layout/AppShell";
import { AssessmentFormClient } from "@/components/assessment/AssessmentFormClient";
import { getShellData } from "@/lib/auth/server-data";
import { getCaseForActor } from "@/lib/services/cases";
import { memoryRepository } from "@/lib/repository/memory";

export default async function MyAssessmentPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const { user, roles, actor } = await getShellData();
  const data = getCaseForActor(actor, caseId);
  const form = memoryRepository.getFormVersion(data.case.selfFormVersionId)!;
  const cycle = memoryRepository.getCurrentCycle();

  return (
    <AppShell user={user} roles={roles}>
      <AssessmentFormClient
        assessmentCase={data.case}
        schema={form.schemaJson}
        stage="SELF"
        initialAnswers={data.draftAnswers}
        employeeName={data.employee?.displayName ?? user.displayName}
        cycleName={cycle?.name ?? ""}
        deadline={cycle?.selfDeadline}
      />
    </AppShell>
  );
}
