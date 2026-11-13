import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { assertCan } from "@/lib/permissions/policy";
import { memoryRepository } from "@/lib/repository/memory";
import { newId } from "@/lib/utils/id";
import { jsonError } from "@/lib/api/errors";
import { z } from "zod";

const rowSchema = z.object({
  employeeCode: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const actor = await requireActor();
    assertCan("admin_manage", actor);
    const body = z.object({ rows: z.array(rowSchema) }).parse(await request.json());
    const rejected: { row: unknown; reason: string }[] = [];
    const accepted: string[] = [];
    const store = memoryRepository.getStore();

    for (const row of body.rows) {
      if (store.users.some((u) => u.employeeCode === row.employeeCode)) {
        rejected.push({ row, reason: "duplicate employeeCode" });
        continue;
      }
      if (store.users.some((u) => u.email.toLowerCase() === row.email.toLowerCase())) {
        rejected.push({ row, reason: "duplicate email" });
        continue;
      }
      store.users.push({
        userId: newId(),
        employeeCode: row.employeeCode,
        email: row.email,
        displayName: row.displayName,
        active: true,
        createdAt: new Date().toISOString(),
      });
      accepted.push(row.employeeCode);
    }

    return NextResponse.json({ accepted, rejected });
  } catch (e) {
    return jsonError(e);
  }
}
