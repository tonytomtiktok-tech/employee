import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { memoryRepository } from "@/lib/repository/memory";
import { z } from "zod";

export async function POST(request: Request) {
  const body = z.object({ email: z.string().email() }).parse(await request.json());
  const user = memoryRepository.findUserByEmail(body.email);
  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, user.email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return NextResponse.json({ ok: true, user });
}
