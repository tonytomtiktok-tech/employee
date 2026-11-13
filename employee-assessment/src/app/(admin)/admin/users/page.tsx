import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import { getShellData } from "@/lib/auth/server-data";
import { hasRole } from "@/lib/permissions/roles";
import { listRosterUsers } from "@/lib/services/admin-users";

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

  const roster = listRosterUsers(actor);

  return (
    <AppShell user={user} roles={roles}>
      <AdminUsersClient initial={roster} />
    </AppShell>
  );
}
