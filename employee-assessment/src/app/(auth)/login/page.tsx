"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApp } from "@/components/providers/AppProvider";

export default function LoginPage() {
  const router = useRouter();
  const { demoAccounts, switchUser } = useApp();
  const [busy, setBusy] = useState<string | null>(null);

  function onSwitch(email: string) {
    setBusy(email);
    switchUser(email);
    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <p className="text-sm text-accent">AssessFlow</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">เข้าสู่ระบบ (เดโม)</h1>
        <p className="mt-2 text-sm text-muted">
          เลือกบทบาทเพื่อทดลองใช้งาน — ข้อมูลอยู่ในเบราว์เซอร์สำหรับเวอร์ชัน GitHub Pages
        </p>
        <div className="mt-6 space-y-2">
          {demoAccounts.map((a) => (
            <Button
              key={a.email}
              variant="secondary"
              className="w-full justify-between"
              onClick={() => onSwitch(a.email)}
              disabled={busy != null}
            >
              <span>{a.label}</span>
              <span className="text-xs text-muted">
                {busy === a.email ? "..." : a.email}
              </span>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
