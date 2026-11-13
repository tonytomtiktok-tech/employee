import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PermissionError } from "@/lib/permissions/policy";
import { newRequestId } from "@/lib/utils/id";

export function jsonError(error: unknown, status?: number) {
  const requestId = newRequestId();
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "ข้อมูลไม่ถูกต้อง",
        code: "VALIDATION",
        requestId,
        details: error.issues,
      },
      { status: 400 },
    );
  }
  if (error instanceof PermissionError) {
    return NextResponse.json(
      { error: error.message, code: "FORBIDDEN", requestId },
      { status: status ?? 403 },
    );
  }
  const err = error as { message?: string; code?: string; details?: unknown };
  if (err?.code === "NOT_FOUND" || err?.message === "ไม่พบเคส") {
    return NextResponse.json(
      { error: "ไม่พบเคส", code: "NOT_FOUND", requestId },
      { status: 404 },
    );
  }
  if (err?.code === "CONFLICT") {
    return NextResponse.json(
      { error: err.message ?? "conflict", code: "CONFLICT", requestId },
      { status: 409 },
    );
  }
  if (err?.code === "VALIDATION") {
    return NextResponse.json(
      {
        error: err.message ?? "validation",
        code: "VALIDATION",
        requestId,
        details: err.details,
      },
      { status: 400 },
    );
  }
  if (err?.message === "UNAUTHENTICATED") {
    return NextResponse.json(
      { error: "ต้องเข้าสู่ระบบ", code: "UNAUTHENTICATED", requestId },
      { status: 401 },
    );
  }
  console.error(`[${requestId}]`, error);
  return NextResponse.json(
    { error: "เกิดข้อผิดพลาดภายในระบบ", code: "INTERNAL", requestId },
    { status: 500 },
  );
}
