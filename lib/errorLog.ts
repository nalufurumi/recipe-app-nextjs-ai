import { supabaseServer } from "./supabase";

export async function logError(route: string, error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[${route}]`, error);

  try {
    await supabaseServer().from("error_logs").insert({
      route,
      message,
      stack: stack ?? null,
      context: context ?? null,
    });
  } catch (loggingError) {
    console.error(`[${route}] failed to write error_logs:`, loggingError);
  }
}
