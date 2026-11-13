import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getShellData } from "@/lib/auth/server-data";
import { memoryRepository } from "@/lib/repository/memory";
import { hasRole } from "@/lib/permissions/roles";

export default async function TeamReviewsPage() {
  const { user, roles, actor } = await getShellData();
  const can = hasRole(actor.roles, "MANAGER") || hasRole(actor.roles, "HR_ADMIN");
  const cases = can
    ? memoryRepository.listCasesForManager(actor.user.userId).map((c) => ({
        ...c,
        employee: memoryRepository.findUserById(c.employeeUserId),
      }))
    : [];

  return (
    <AppShell user={user} roles={roles}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">รีวิวทีม</h1>
          <p className="mt-2 text-sm text-muted">
            เห็นเฉพาะลูกทีมที่ถูกมอบหมายให้คุณในรอบนี้
          </p>
        </header>
        {!can ? (
          <Card>
            <p className="text-sm text-muted">บัญชีนี้ไม่มีบทบาทหัวหน้างาน</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <Link
                key={c.caseId}
                href={`/team/reviews/${c.caseId}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">{c.employee?.displayName}</p>
                  <p className="text-xs text-muted">{c.employee?.employeeCode}</p>
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
