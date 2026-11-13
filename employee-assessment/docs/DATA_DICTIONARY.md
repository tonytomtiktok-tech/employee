# Data Dictionary

Tabs / entities mirror the architecture spreadsheet schema:

Users, OrgUnits, Memberships, RoleAssignments, Cycles, FormVersions, Cases, CommitteeAssignments, Responses, Submissions, FinalResults, DevelopmentPlans, AuditLog.

IDs are UUIDs / stable string IDs — never row numbers. Cases have optimistic `version` for concurrency checks.
