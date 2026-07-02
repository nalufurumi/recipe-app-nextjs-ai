import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, hashPassword } from "./lib/auth";

const PROTECTED_PAGE_PATTERNS = [
  /^\/upload(\/.*)?$/,
  /^\/recipes\/[^/]+\/edit(\/.*)?$/,
  /^\/dev-tools(\/.*)?$/,
];

function isProtected(pathname: string, method: string): boolean {
  if (PROTECTED_PAGE_PATTERNS.some((pattern) => pattern.test(pathname))) {
    return true;
  }

  // Recipe write/AI-cost APIs stay behind the password gate; recipe reads
  // (GET /api/recipes, GET /api/recipes/[id]) are intentionally public so
  // the list/detail pages work without login.
  if (pathname === "/api/recipes" && method === "POST") return true;
  if (pathname === "/api/recipes/draft" && method === "POST") return true;
  if (pathname === "/api/recipes/chef-check" && method === "POST") return true;
  if (/^\/api\/recipes\/[^/]+$/.test(pathname) && (method === "PUT" || method === "DELETE")) {
    return true;
  }
  if (pathname === "/api/dev-tools/login") return true;

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/login" ||
    pathname === "/api/login" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (!isProtected(pathname, request.method)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(AUTH_COOKIE);
  const expected = await hashPassword(process.env.APP_PASSWORD ?? "");
  if (cookie?.value === expected) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/((?!_next/static|_next/image).*)",
};
