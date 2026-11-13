import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { getShellData } from "@/lib/auth/server-data";
import { memoryRepository } from "@/lib/repository/memory";
import { hasRole } from "@/lib/permissions/roles";

export default async function AdminCyclesPage() {
  const { user, roles, actor } = await getShellData();
  if (!hasRole(actor.roles, "HR_ADMIN")) {
    return (
      <AppShell user={user} roles={roles}>
        <Card>
          <p className="text-sm text-muted">เฉพาะ HR Admin</p>
        </Card>
      </AppShell>
    );
  }
  const cycles = memoryRepository.getStore().cycles;
  const cases = memoryRepository.getStore().cases;

  return (
    <AppShell user={user} roles={roles}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">รอบประเมิน</h1>
          <p className="mt-2 text-sm text-muted">
            เปิด/ปิดรอบ กำหนด deadline และติดตามสถานะเคส
          </p>
        </header>
        {cycles.map((c) => (
          <Card key={c.cycleId}>
            <h2 className="font-display text-lg font-semibold">{c.name}</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">สถานะ</dt>
                <dd>{c.status}</dd>
              </div>
              <div>
                <dt className="text-muted">จำนวนเคส</dt>
                <dd>{cases.filter((x) => x.cycleId === c.cycleId).length}</dd>
              </div>
              <div>
                <dt className="text-muted">กำหนดส่งตนเอง</dt>
                <dd>
                  {new Date(c.selfDeadline).toLocaleString("th-TH", {
                    timeZone: "Asia/Bangkok",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-muted">กำหนดหัวหน้า</dt>
                <dd>
                  {new Date(c.managerDeadline).toLocaleString("th-TH", {
                    timeZone: "Asia/Bangkok",
                  })}
                </dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
