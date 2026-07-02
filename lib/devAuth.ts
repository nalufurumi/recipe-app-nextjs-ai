export const DEV_AUTH_COOKIE = "recipe_book_dev_auth";

export function devToolsPassword(): string {
  return process.env.DEV_TOOLS_PASSWORD || "0000";
}
