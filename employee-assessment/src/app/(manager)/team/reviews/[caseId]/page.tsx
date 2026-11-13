import { AppShell } from "@/components/layout/AppShell";
import { AssessmentFormClient } from "@/components/assessment/AssessmentFormClient";
import { ManagerReview } from "@/components/review/ManagerReview";
import { SelfComparison } from "@/components/review/SelfComparison";
import { getShellData } from "@/lib/auth/server-data";
import { getCaseForActor } from "@/lib/services/cases";
import { memoryRepository } from "@/lib/repository/memory";

export default async function ManagerCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const { user, roles, actor } = await getShellData();
  const data = getCaseForActor(actor, caseId);
  const form = memoryRepository.getFormVersion(data.case.managerFormVersionId)!;
  const selfForm = memoryRepository.getFormVersion(data.case.selfFormVersionId)!;
  const cycle = memoryRepository.getCurrentCycle();

  return (
    <AppShell user={user} roles={roles}>
      <AssessmentFormClient
        assessmentCase={data.case}
        schema={form.schemaJson}
        stage="MANAGER"
        initialAnswers={data.draftAnswers}
        employeeName={data.employee?.displayName ?? ""}
        cycleName={cycle?.name ?? ""}
        deadline={cycle?.managerDeadline}
        extraTop={
          <div className="grid gap-4 lg:grid-cols-2">
            <ManagerReview selfAnswers={data.selfAnswers} />
            <SelfComparison
              schema={selfForm.schemaJson}
              selfAnswers={data.selfAnswers}
              managerAnswers={data.draftAnswers}
            />
          </div>
        }
      />
    </AppShell>
  );
}
