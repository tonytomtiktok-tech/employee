import * as XLSX from "xlsx";

export type ExcelRosterRow = {
  employeeCode: string;
  password?: string;
  displayName: string;
  role: string;
  email?: string;
};

const HEADER_MAP: Record<string, keyof ExcelRosterRow> = {
  รหัส: "employeeCode",
  รหัสพนักงาน: "employeeCode",
  employeecode: "employeeCode",
  code: "employeeCode",
  password: "password",
  passwords: "password",
  รหัสผ่าน: "password",
  ชื่อ: "displayName",
  ชื่อสกุล: "displayName",
  displayname: "displayName",
  name: "displayName",
  บทบาท: "role",
  role: "role",
  อีเมล: "email",
  email: "email",
};

function normalizeHeader(h: unknown): string {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function parseRosterExcel(buffer: ArrayBuffer): ExcelRosterRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return raw
    .map((row) => {
      const mapped: Partial<ExcelRosterRow> = {};
      for (const [key, value] of Object.entries(row)) {
        const field = HEADER_MAP[normalizeHeader(key)] ?? HEADER_MAP[key.trim()];
        if (!field) continue;
        const text = String(value ?? "").trim();
        if (!text) continue;
        mapped[field] = text;
      }
      if (!mapped.employeeCode || !mapped.displayName || !mapped.role) return null;
      return mapped as ExcelRosterRow;
    })
    .filter((r): r is ExcelRosterRow => r != null);
}

export function downloadRosterTemplate(): void {
  const rows = [
    {
      รหัส: "E9001",
      passwords: "Demo@E9001",
      ชื่อ: "ตัวอย่าง คนดี",
      บทบาท: "ผู้ถูกประเมิน",
    },
    {
      รหัส: "E9002",
      passwords: "Demo@E9002",
      ชื่อ: "ตัวอย่าง หัวหน้า",
      บทบาท: "หัวหน้าประเมิน",
    },
    {
      รหัส: "E9003",
      passwords: "Demo@E9003",
      ชื่อ: "ตัวอย่าง กรรมการ",
      บทบาท: "คณะกรรมการประเมิน",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "users");
  XLSX.writeFile(wb, "roster-import-template.xlsx");
}
