# Security

- Secrets only in server environment variables (see `.env.example`).
- Session cookie is httpOnly (`ea_demo_user` for Phase 0 demo only).
- `assertCan` gates every sensitive service action.
- Unauthorized case access returns NOT_FOUND to avoid leakage.
- Sheet cell writes must use `encodeSheetCell` to prevent formula injection (Phase 2).
- Do not log PII in error payloads.
- Production: replace demo switch-user with Google Workspace OIDC + MFA at IdP; add CSRF, rate limits, immutable audit stream outside Sheets.
