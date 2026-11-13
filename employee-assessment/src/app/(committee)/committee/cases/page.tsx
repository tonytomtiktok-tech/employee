"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useApp } from "@/components/providers/AppProvider";
import { getCommitteeCases } from "@/lib/services/cases";
import { memoryRepository } from "@/lib/repository/memory";
import { hasRole } from "@/lib/permissions/roles";

export default function CommitteeCasesPage() {
  const { user, roles, actor } = useApp();
  const can = hasRole(actor.roles, "COMMITTEE") || hasRole(actor.roles, "HR_ADMIN");
  const cases = can
    ? getCommitteeCases(actor).map((c) => ({
        ...c,
        employee: memoryRepository.findUserById(c.employeeUserId),
      }))
    : [];

  return (
    <AppShell user={user} roles={roles}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">คิวกรรมการ</h1>
          <p className="mt-2 text-sm text-muted">
            เฉพาะเคสที่มอบหมายให้คุณ และไม่มี conflict
          </p>
        </header>
        {!can ? (
          <Card>
            <p className="text-sm text-muted">บัญชีนี้ไม่มีบทบาทกรรมการ</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <Link
                key={c.caseId}
                href={`/committee/cases/${c.caseId}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">{c.employee?.displayName}</p>
                  <p className="text-xs text-muted">{c.status}</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
