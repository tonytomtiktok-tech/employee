# Product Spec — AssessFlow

Goal: assessment website for ~200 employees. Employees self-assess; managers review assigned reports; committee finalizes assigned cases; executives see permission-filtered published dashboards; HR administers cycles, forms, roster and publishing.

## Personas

EMPLOYEE, MANAGER, COMMITTEE, EXECUTIVE, HR_ADMIN, SYSTEM_ADMIN — see architecture access matrix.

## Non-negotiables

- Named accounts mapped to employee ID; never trust client-supplied role/ID alone.
- Server-side authorization per case.
- No browser-to-Sheets access.
- Immutable submissions + audit; idempotent submits.
- Dashboard uses published finalized scores by default.
- Versioned forms per cycle.

## Phase status

Phase 0 implemented with in-memory repository and demo login. Later phases: Auth.js SSO, Sheets adapter, hardening.
