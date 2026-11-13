"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ROLE_LABELS_TH } from "@/lib/permissions/roles";
import type { Role, User } from "@/types";

const NAV: { href: string; label: string; roles?: Role[] }[] = [
  { href: "/", label: "หน้าแรก" },
  { href: "/my-assessment", label: "ประเมินของฉัน", roles: ["EMPLOYEE", "MANAGER", "COMMITTEE", "HR_ADMIN"] },
  { href: "/team/reviews", label: "ทีมของฉัน", roles: ["MANAGER", "HR_ADMIN"] },
  { href: "/committee/cases", label: "คิวกรรมการ", roles: ["COMMITTEE", "HR_ADMIN"] },
  { href: "/executive", label: "แดชบอร์ดผู้บริหาร", roles: ["EXECUTIVE", "HR_ADMIN"] },
  { href: "/admin/users", label: "ผู้ใช้", roles: ["HR_ADMIN"] },
  { href: "/admin/cycles", label: "รอบประเมิน", roles: ["HR_ADMIN"] },
  { href: "/admin/forms", label: "แบบฟอร์ม", roles: ["HR_ADMIN"] },
  { href: "/login", label: "สลับบัญชีเดโม" },
];

export function AppShell({
  user,
  roles,
  children,
}: {
  user: User;
  roles: Role[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = NAV.filter(
    (n) => !n.roles || n.roles.some((r) => roles.includes(r)),
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-sidebar text-sidebar-text">
        <div className="border-b border-white/10 px-5 py-6">
          <p className="font-display text-lg font-semibold tracking-tight text-white">
            AssessFlow
          </p>
          <p className="mt-1 text-xs text-slate-300">
            แพลตฟอร์มประเมินพนักงาน
          </p>
        </div>
        <nav className="space-y-1 p-3" aria-label="เมนูหลัก">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-teal-700/40 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 p-4 text-xs text-slate-300">
          <p className="font-medium text-white">{user.displayName}</p>
          <p>{user.email}</p>
          <p className="mt-1">
            {roles.map((r) => ROLE_LABELS_TH[r]).join(" · ")}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">เขตเวลา Asia/Bangkok</p>
        </div>
      </aside>
      <main className="px-4 py-6 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
