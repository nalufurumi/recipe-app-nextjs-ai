import { createClient } from "@supabase/supabase-js";

type RecipeRow = {
  id: string;
  title: string;
  description: string;
  servings: string;
  time: string;
  level: string;
  ingredient_groups: unknown;
  steps: unknown;
  tips: unknown;
  raw_input: string;
  chef_check: unknown;
  created_at: string;
};

type Database = {
  public: {
    Tables: {
      recipes: {
        Row: RecipeRow;
        Insert: Omit<RecipeRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<RecipeRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

let client: ReturnType<typeof createClient<Database>> | null = null;

export function supabaseServer() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  client = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
  return client;
}
