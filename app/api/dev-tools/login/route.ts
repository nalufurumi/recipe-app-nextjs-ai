import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hashPassword } from "@/lib/auth";
import { DEV_AUTH_COOKIE, devToolsPassword } from "@/lib/devAuth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== devToolsPassword()) {
    return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_AUTH_COOKIE, await hashPassword(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
