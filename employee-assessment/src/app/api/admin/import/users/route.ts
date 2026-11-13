import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActor } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/errors";
import { importRosterRows } from "@/lib/services/admin-users";

const bodySchema = z.object({
  rows: z.array(
    z.object({
      employeeCode: z.string().min(1),
      displayName: z.string().min(1),
      password: z.string().optional(),
      email: z.string().optional(),
      role: z.string().min(1),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const actor = await requireActor();
    const body = bodySchema.parse(await request.json());
    const result = importRosterRows(actor, body.rows);
    return NextResponse.json({
      accepted: result.accepted.map((u) => u.employeeCode),
      rejected: result.rejected,
      users: result.accepted,
    });
  } catch (e) {
    return jsonError(e);
  }
}
