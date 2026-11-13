import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { getShellData } from "@/lib/auth/server-data";
import { memoryRepository } from "@/lib/repository/memory";
import { hasRole } from "@/lib/permissions/roles";

export default async function AdminFormsPage() {
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
  const forms = memoryRepository.getStore().formVersions;

  return (
    <AppShell user={user} roles={roles}>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold">แบบฟอร์มตามเวอร์ชัน</h1>
          <p className="mt-2 text-sm text-muted">
            แบบที่ถูกแช่แข็งแล้วจะไม่ถูกแก้ย้อนหลังเมื่อสร้างเวอร์ชันใหม่
          </p>
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
              <p className="mt-1 text-xs text-muted">
                แช่แข็ง:{" "}
                {f.frozenAt
                  ? new Date(f.frozenAt).toLocaleString("th-TH", {
                      timeZone: "Asia/Bangkok",
                    })
                  : "ยังเป็นร่าง"}
              </p>
              <p className="mt-3 text-sm">
                {f.schemaJson.sections.length} ส่วน ·{" "}
                {f.schemaJson.sections.reduce(
                  (n, s) => n + s.questions.length,
                  0,
                )}{" "}
                คำถาม
              </p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
