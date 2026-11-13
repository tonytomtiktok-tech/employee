import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActor } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/errors";
import {
  createRosterUser,
  importRosterRows,
  listRosterUsers,
} from "@/lib/services/admin-users";

const createSchema = z.object({
  employeeCode: z.string().min(1),
  displayName: z.string().min(1),
  password: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["EMPLOYEE", "MANAGER", "COMMITTEE"]),
});

const importSchema = z.object({
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

export async function GET() {
  try {
    const actor = await requireActor();
    return NextResponse.json(listRosterUsers(actor));
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireActor();
    const json = await request.json();

    if (Array.isArray(json?.rows)) {
      const body = importSchema.parse(json);
      const result = importRosterRows(actor, body.rows);
      return NextResponse.json(result);
    }

    const body = createSchema.parse(json);
    const user = createRosterUser(actor, body);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
