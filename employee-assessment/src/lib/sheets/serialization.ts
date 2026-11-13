/** Prevent formula injection when writing untrusted strings to Sheets cells. */
export function encodeSheetCell(value: unknown): string | number | boolean {
  if (typeof value === "number" || typeof value === "boolean") return value;
  const str = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export function safeJson(value: unknown): string {
  return encodeSheetCell(JSON.stringify(value)) as string;
}
