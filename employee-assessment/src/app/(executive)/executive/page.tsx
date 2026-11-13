import { AppShell } from "@/components/layout/AppShell";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { ScoreDistribution } from "@/components/dashboard/ScoreDistribution";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { OrgDrilldown } from "@/components/dashboard/OrgDrilldown";
import { TalentMatrix } from "@/components/dashboard/TalentMatrix";
import { getShellData } from "@/lib/auth/server-data";
import { getDashboardDrilldown, getDashboardSummary } from "@/lib/services/dashboard";
import { memoryRepository } from "@/lib/repository/memory";
import { hasAnyRole } from "@/lib/permissions/roles";
import { Card } from "@/components/ui/card";

export default async function ExecutivePage() {
  const { user, roles, actor } = await getShellData();
  const can = hasAnyRole(actor.roles, ["EXECUTIVE", "HR_ADMIN"]);
  const cycle = memoryRepository.getCurrentCycle();

  if (!can || !cycle) {
    return (
      <AppShell user={user} roles={roles}>
        <Card>
          <p className="text-sm text-muted">ไม่มีสิทธิ์ดูแดชบอร์ดผู้บริหาร</p>
        </Card>
      </AppShell>
    );
  }

  const summary = getDashboardSummary(actor, cycle.cycleId);
  let people: {
    caseId: string;
    employeeCode: string;
    displayName: string;
    finalScore: number | null;
    talentSegment: string | null;
  }[] = [];
  try {
    const drill = getDashboardDrilldown(actor, cycle.cycleId);
    people = drill.people;
  } catch {
    people = [];
  }

  return (
    <AppShell user={user} roles={roles}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">แดชบอร์ดผู้บริหาร</h1>
          <p className="mt-2 text-sm text-muted">
            {cycle.name} · แสดงเฉพาะผลที่เผยแพร่แล้ว · ไม่ใช้คะแนนเป็นตัวชี้วัดคุณค่าบุคคลโดยสิ้นเชิง
          </p>
        </header>
        <KpiCards totals={summary.totals} />
        <div className="grid gap-4 xl:grid-cols-2">
          <ScoreDistribution
            distribution={summary.metrics.distribution}
            masked={summary.metrics.masked}
            N={summary.metrics.N}
          />
          <TrendChart />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <OrgDrilldown people={people} />
          <TalentMatrix />
        </div>
        {summary.metrics.mean != null ? (
          <p className="text-sm text-muted">
            ค่าเฉลี่ย {summary.metrics.mean} · มัธยฐาน {summary.metrics.median} · N ={" "}
            {summary.metrics.N}
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
