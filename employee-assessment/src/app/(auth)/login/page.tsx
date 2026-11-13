"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ACCOUNTS = [
  { label: "พนักงาน", email: "emp016@demo.local" },
  { label: "หัวหน้างาน", email: "emp001@demo.local" },
  { label: "กรรมการ", email: "emp009@demo.local" },
  { label: "ผู้บริหาร", email: "emp013@demo.local" },
  { label: "HR Admin", email: "emp015@demo.local" },
];

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function switchUser(email: string) {
    setBusy(email);
    setError(null);
    const res = await fetch("/api/demo/switch-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(null);
    if (!res.ok) {
      setError("สลับบัญชีไม่สำเร็จ");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <p className="text-sm text-accent">AssessFlow Demo</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">เข้าสู่ระบบ (เดโม)</h1>
        <p className="mt-2 text-sm text-muted">
          Phase 0 ใช้การสลับบัญชีจำลองแทน SSO จริง — Phase 1 จะเชื่อม Google Workspace / Auth.js
        </p>
        <div className="mt-6 space-y-2">
          {ACCOUNTS.map((a) => (
            <Button
              key={a.email}
              variant="secondary"
              className="w-full justify-between"
              onClick={() => switchUser(a.email)}
              disabled={busy != null}
            >
              <span>{a.label}</span>
              <span className="text-xs text-muted">
                {busy === a.email ? "..." : a.email}
              </span>
            </Button>
          ))}
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </Card>
    </div>
  );
}
