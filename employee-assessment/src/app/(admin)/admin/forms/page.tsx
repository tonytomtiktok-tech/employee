"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { useApp } from "@/components/providers/AppProvider";
import { memoryRepository } from "@/lib/repository/memory";
import { hasRole } from "@/lib/permissions/roles";

export default function AdminFormsPage() {
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
  const forms = memoryRepository.getStore().formVersions;

  return (
    <AppShell user={user} roles={roles}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">แบบฟอร์มตามเวอร์ชัน</h1>
        </header>
        <div className="grid gap-4 lg:grid-cols-3">
          {forms.map((f) => (
            <Card key={f.formVersionId}>
              <p className="text-xs text-muted">{f.formVersionId}</p>
              <h2 className="mt-1 font-display text-lg font-semibold">
                {f.schemaJson.title}
              </h2>
              <p className="mt-2 text-sm text-muted">
                ขั้น {f.role} · v{f.version}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
