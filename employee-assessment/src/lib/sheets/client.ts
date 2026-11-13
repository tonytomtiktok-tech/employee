/**
 * Google Sheets client stub — Phase 2.
 * Credentials must live only in server env; never expose to the browser.
 */
export function getSheetsClient(): never {
  throw new Error(
    "Google Sheets adapter is not configured yet (Phase 2). Using in-memory repository.",
  );
}
