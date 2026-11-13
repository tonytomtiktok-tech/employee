import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { getShellData } from "@/lib/auth/server-data";
import { memoryRepository } from "@/lib/repository/memory";
import { hasRole } from "@/lib/permissions/roles";
import { ROLE_LABELS_TH } from "@/lib/permissions/roles";

export default async function AdminUsersPage() {
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

  const users = memoryRepository.listUsers().slice(0, 50);
  const assignments = memoryRepository.getStore().roleAssignments;

  return (
    <AppShell user={user} roles={roles}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">ผู้ใช้และบทบาท</h1>
          <p className="mt-2 text-sm text-muted">
            แสดง 50 คนแรกจากทั้งหมด {memoryRepository.listUsers().length} คน (seed เดโม)
          </p>
        </header>
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-muted">
              <tr>
                <th className="px-4 py-3">รหัส</th>
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">อีเมล</th>
                <th className="px-4 py-3">บทบาท</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const userRoles = [
                  ...new Set(
                    assignments
                      .filter((a) => a.userId === u.userId && a.active)
                      .map((a) => ROLE_LABELS_TH[a.role]),
                  ),
                ];
                return (
                  <tr key={u.userId} className="border-t border-border">
                    <td className="px-4 py-3">{u.employeeCode}</td>
                    <td className="px-4 py-3">{u.displayName}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{userRoles.join(", ") || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
