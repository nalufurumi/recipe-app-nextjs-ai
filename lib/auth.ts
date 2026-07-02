import { cookies } from "next/headers";

export const AUTH_COOKIE = "recipe_book_auth";

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const cookie = store.get(AUTH_COOKIE);
  const expected = await hashPassword(process.env.APP_PASSWORD ?? "");
  return cookie?.value === expected;
}
