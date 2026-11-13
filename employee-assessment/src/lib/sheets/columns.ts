export const SHEET_TABS = [
  "Users",
  "OrgUnits",
  "Memberships",
  "RoleAssignments",
  "Cycles",
  "FormVersions",
  "Cases",
  "CommitteeAssignments",
  "Responses",
  "Submissions",
  "FinalResults",
  "DevelopmentPlans",
  "AuditLog",
] as const;

export type SheetTab = (typeof SHEET_TABS)[number];
