"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { useApp } from "@/components/providers/AppProvider";
import { memoryRepository } from "@/lib/repository/memory";
import { hasRole } from "@/lib/permissions/roles";

export default function AdminCyclesPage() {
  const { user, roles, actor } = useApp();
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
            </dl>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
