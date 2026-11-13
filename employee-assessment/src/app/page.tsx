import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { getShellData } from "@/lib/auth/server-data";
import { memoryRepository } from "@/lib/repository/memory";
import { getMyCases } from "@/lib/services/cases";
import { StatusBadge } from "@/components/ui/badge";

export default async function HomePage() {
  const { user, roles, actor } = await getShellData();
  const cycle = memoryRepository.getCurrentCycle();
  const myCases = getMyCases(actor);
  const store = memoryRepository.getStore();

  return (
    <AppShell user={user} roles={roles}>
      <div className="space-y-6">
        <header>
          <p className="text-sm text-muted">ยินดีต้อนรับ</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {user.displayName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            แพลตฟอร์มประเมินพนักงานรอบ {cycle?.name} — ใช้บัญชีเดโมสลับบทบาทได้ที่หน้าเข้าสู่ระบบ
            ข้อมูลอยู่ใน memory repository (Phase 0) ยังไม่เชื่อม Google Sheets
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs text-muted">ผู้ใช้ในระบบ</p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {store.users.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-muted">เคสในรอบนี้</p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {store.cases.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-muted">ผลที่เผยแพร่แล้ว</p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {store.finalResults.filter((f) => f.publishedAt).length}
            </p>
          </Card>
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">เคสของฉัน</h2>
          <div className="mt-4 space-y-3">
            {myCases.length === 0 ? (
              <p className="text-sm text-muted">ไม่พบเคส</p>
            ) : (
              myCases.map((c) => (
                <Link
                  key={c.caseId}
                  href={`/my-assessment/${c.caseId}`}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium">{c.caseId}</p>
                    <p className="text-xs text-muted">{cycle?.name}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
