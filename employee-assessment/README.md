# AssessFlow — Employee Assessment Workflow Platform

Next.js implementation of `EMPLOYEE_ASSESSMENT_GOOGLE_SHEETS_ARCHITECTURE.md`.

## Current phase

**Phase 0 (+ core of Phase 1–6 scaffolding):** UI shell, 200 fake users in an in-memory repository, role-based pages, JSON mock forms, workflow/permission services, API route handlers, and unit tests. Google Sheets adapter and real SSO are stubbed for later phases.

## Live website (GitHub Pages)

หลัง push ไป `main` workflow จะ build และเผยแพร่ที่:

**https://tonytomtiktok-tech.github.io/employee/**

ครั้งแรกให้เปิด GitHub → **Settings → Pages → Source = GitHub Actions**

## Quick start (local)

```bash
cd employee-assessment
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) then go to **สลับบัญชีเดโม** (`/login`).

```bash
npm run build:pages   # static export for GitHub Pages
```

| บทบาท | อีเมลเดโม |
|---|---|
| พนักงาน | `emp016@demo.local` |
| หัวหน้างาน | `emp001@demo.local` |
| กรรมการ | `emp009@demo.local` |
| ผู้บริหาร | `emp013@demo.local` |
| HR Admin | `emp015@demo.local` |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm test` — Vitest unit tests
- `npx tsx scripts/seed-demo-200.ts` — print seed summary

## Architecture notes

- Authorization is enforced in server services (`assertCan`), not only in pages.
- Forms are loaded from versioned JSON; scores for self / manager / committee stay separate.
- Executive dashboard counts **PUBLISHED** results only and masks small-N aggregates.
- No Google API credentials in client code. See `.env.example`.

## Docs

- `docs/PRODUCT_SPEC.md`
- `docs/SECURITY.md`
- `docs/DATA_DICTIONARY.md`
- `docs/WORKFLOW.md`
- `docs/DEPLOYMENT.md`
