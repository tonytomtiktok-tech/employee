"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  downloadRosterTemplate,
  parseRosterExcel,
} from "@/lib/admin/excel-roster";
import type { RosterRole } from "@/types";

export type RosterUserRow = {
  userId: string;
  employeeCode: string;
  password: string;
  displayName: string;
  email: string;
  role: RosterRole;
  roleLabel: string;
  active: boolean;
};

type TabKey = "EMPLOYEE" | "MANAGER" | "COMMITTEE";

const TABS: { key: TabKey; title: string; hint: string }[] = [
  {
    key: "EMPLOYEE",
    title: "ตารางผู้ถูกประเมิน",
    hint: "พนักงานที่ต้องประเมินตนเอง",
  },
  {
    key: "MANAGER",
    title: "ตารางหัวหน้าประเมิน",
    hint: "หัวหน้าที่ประเมินลูกทีม",
  },
  {
    key: "COMMITTEE",
    title: "ตารางคณะกรรมการประเมิน",
    hint: "กรรมการที่สรุปผลเคส",
  },
];

export function AdminUsersClient({
  initial,
}: {
  initial: {
    employees: RosterUserRow[];
    managers: RosterUserRow[];
    committee: RosterUserRow[];
  };
}) {
  const [employees, setEmployees] = useState(initial.employees);
  const [managers, setManagers] = useState(initial.managers);
  const [committee, setCommittee] = useState(initial.committee);
  const [tab, setTab] = useState<TabKey>("EMPLOYEE");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => {
    if (tab === "MANAGER") return managers;
    if (tab === "COMMITTEE") return committee;
    return employees;
  }, [tab, employees, managers, committee]);

  function pushRow(user: RosterUserRow) {
    if (user.role === "MANAGER") setManagers((prev) => [...prev, user].sort(byCode));
    else if (user.role === "COMMITTEE")
      setCommittee((prev) => [...prev, user].sort(byCode));
    else setEmployees((prev) => [...prev, user].sort(byCode));
  }

  async function addUser() {
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeCode: code,
        displayName: name,
        password: password || undefined,
        role: tab,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "เพิ่มผู้ใช้ไม่สำเร็จ");
      return;
    }
    pushRow(data.user);
    setCode("");
    setPassword("");
    setName("");
    setMessage(`เพิ่ม ${data.user.displayName} เป็น${data.user.roleLabel} แล้ว`);
  }

  async function onExcelSelected(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseRosterExcel(buffer);
      if (parsed.length === 0) {
        setError("ไม่พบแถวข้อมูลในไฟล์ (ต้องมีคอลัมน์ รหัส, ชื่อ, บทบาท)");
        setBusy(false);
        return;
      }
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed }),
      });
      const data = await res.json();
      setBusy(false);
      if (!res.ok) {
        setError(data.error ?? "นำเข้าไม่สำเร็จ");
        return;
      }
      for (const user of data.accepted as RosterUserRow[]) pushRow(user);
      setMessage(
        `นำเข้าสำเร็จ ${data.accepted.length} รายการ` +
          (data.rejected?.length
            ? ` · ไม่สำเร็จ ${data.rejected.length} รายการ`
            : ""),
      );
      if (data.rejected?.length) {
        setError(
          data.rejected
            .slice(0, 5)
            .map(
              (r: { reason: string; row: { employeeCode?: string } }) =>
                `${r.row?.employeeCode ?? "?"} — ${r.reason}`,
            )
            .join("; "),
        );
      }
    } catch {
      setBusy(false);
      setError("อ่านไฟล์ Excel ไม่สำเร็จ");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const currentTab = TABS.find((t) => t.key === tab)!;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">ผู้ใช้และบทบาท</h1>
          <p className="mt-2 text-sm text-muted">
            จัดการบัญชีผู้ถูกประเมิน หัวหน้าประเมิน และคณะกรรมการ · รองรับ Import Excel
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={downloadRosterTemplate}>
            ดาวน์โหลดเทมเพลต Excel
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            Import Excel
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => onExcelSelected(e.target.files?.[0] ?? null)}
          />
        </div>
      </header>

      {message ? (
        <div className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "rounded-full bg-accent px-4 py-2 text-sm text-white"
                : "rounded-full border border-border bg-white px-4 py-2 text-sm text-muted hover:border-accent/40"
            }
          >
            {t.title} ({t.key === "EMPLOYEE" ? employees.length : t.key === "MANAGER" ? managers.length : committee.length})
          </button>
        ))}
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold">
          เพิ่ม{currentTab.title.replace("ตาราง", "")}
        </h2>
        <p className="mt-1 text-xs text-muted">{currentTab.hint}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="block text-sm">
            <span className="text-muted">รหัส</span>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="E0101"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Password</span>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="เว้นว่าง = สร้างให้อัตโนมัติ"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">ชื่อ</span>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อ-นามสกุล"
            />
          </label>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={addUser}
              disabled={busy || !code.trim() || !name.trim()}
            >
              เพิ่มผู้ใช้
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          บทบาทที่จะบันทึก: <strong>{currentTab.title.replace("ตาราง", "")}</strong>
        </p>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="border-b border-border bg-slate-50 px-4 py-3">
          <h2 className="font-display text-base font-semibold">{currentTab.title}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white text-xs text-muted">
              <tr>
                <th className="px-4 py-3">รหัส</th>
                <th className="px-4 py-3">Password</th>
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">บทบาท</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    ยังไม่มีผู้ใช้ในตารางนี้
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={`${u.role}-${u.userId}`} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{u.employeeCode}</td>
                    <td className="px-4 py-3 font-mono text-xs">{u.password}</td>
                    <td className="px-4 py-3">{u.displayName}</td>
                    <td className="px-4 py-3">{u.roleLabel}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function byCode(a: RosterUserRow, b: RosterUserRow) {
  return a.employeeCode.localeCompare(b.employeeCode);
}
