import { NextResponse } from "next/server";
import { requireActor } from "@/lib/auth/session";
import { assertCan } from "@/lib/permissions/policy";
import { memoryRepository } from "@/lib/repository/memory";
import { jsonError } from "@/lib/api/errors";

export async function GET() {
  try {
    const actor = await requireActor();
    assertCan("admin_manage", actor);
    return NextResponse.json({
      forms: memoryRepository.getStore().formVersions,
    });
  } catch (e) {
    return jsonError(e);
  }
}
