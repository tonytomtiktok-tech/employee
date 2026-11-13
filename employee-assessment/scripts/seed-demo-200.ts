/**
 * Re-seeds the in-memory store (useful when running outside Next.js).
 * For Sheets seeding, see setup-sheets.ts (Phase 2).
 */
import { createSeedStore } from "../src/lib/repository/seed";

const store = createSeedStore();
console.log(
  JSON.stringify(
    {
      users: store.users.length,
      cases: store.cases.length,
      orgUnits: store.orgUnits.length,
      published: store.finalResults.filter((f) => f.publishedAt).length,
      sample: store.users.slice(0, 3).map((u) => u.email),
    },
    null,
    2,
  ),
);
