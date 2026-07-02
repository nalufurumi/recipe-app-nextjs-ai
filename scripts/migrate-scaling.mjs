// One-shot migration: classify existing ingredient qty text into
// scalable/baseAmount/unit fields using the same rules as lib/anthropic.ts.
//
// Usage:
//   node scripts/migrate-scaling.mjs            (dry-run: prints results only)
//   node scripts/migrate-scaling.mjs --apply     (writes results to Supabase)
//
// Reads ANTHROPIC_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from
// process.env, falling back to .env.local in the project root (same
// variables the Next.js app itself uses).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

const APPLY = process.argv.includes("--apply");

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing ANTHROPIC_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Set them in the environment or in .env.local at the project root."
  );
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// This script only does REST reads/writes (no channels/subscriptions), so
// realtime is never actually used. Supplying a transport stub skips
// supabase-js's eager WebSocket-environment check, which otherwise throws
// on Node < 22 (no native WebSocket global).
class NoopWebSocketTransport {}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: NoopWebSocketTransport },
});

const CLASSIFY_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          scalable: {
            type: "boolean",
            description:
              "qtyが具体的な数値+単位として解釈できる場合はtrue。「少々」「お好みで」「適量」など曖昧な表現はfalse",
          },
          baseAmount: {
            type: ["number", "null"],
            description: "scalableがtrueの場合の基準数値(例: 200)。falseの場合はnull",
          },
          unit: {
            type: ["string", "null"],
            description: "scalableがtrueの場合の単位(例: 'g' '本' '個' 'ml' '大さじ')。falseの場合はnull",
          },
        },
        required: ["id", "scalable"],
      },
    },
  },
  required: ["items"],
};

async function classifyItems(items) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system:
      "あなたは日本語の料理レシピの材料分量を解析するアシスタントです。" +
      "各材料の qty (表示テキスト、例: '200g' '1/2本' '少々') を見て、" +
      "具体的な数値+単位として解釈できる場合は scalable: true とし baseAmount に数値、unit に単位を入れてください。" +
      "「少々」「お好みで」「適量」のように曖昧・非数値的な表現は無理に数値化せず scalable: false とし、" +
      "baseAmount と unit は null にしてください。渡された id をそのまま結果に含めてください。",
    messages: [{ role: "user", content: JSON.stringify(items) }],
    tools: [
      {
        name: "classify_ingredients",
        description: "材料のスケーリング可否を分類する",
        input_schema: CLASSIFY_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "classify_ingredients" },
  });

  const block = message.content.find(
    (b) => b.type === "tool_use" && b.name === "classify_ingredients"
  );
  if (!block) throw new Error("Claude did not call classify_ingredients");
  return block.input.items;
}

async function main() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, ingredient_groups")
    .order("created_at", { ascending: true });

  if (error) throw error;

  console.log(`Found ${recipes.length} recipe(s).`);
  console.log(APPLY ? "Mode: APPLY (will write to DB)\n" : "Mode: DRY-RUN (no DB writes)\n");

  for (const recipe of recipes) {
    console.log(`\n=== ${recipe.title} (${recipe.id}) ===`);

    const flatItems = recipe.ingredient_groups.flatMap((g) =>
      g.items.map((it) => ({ id: it.id, name: it.name, qty: it.qty }))
    );

    if (flatItems.length === 0) {
      console.log("  (no ingredients)");
      continue;
    }

    const classified = await classifyItems(flatItems);
    const byId = new Map(classified.map((c) => [c.id, c]));

    const updatedGroups = recipe.ingredient_groups.map((g) => ({
      ...g,
      items: g.items.map((it) => {
        const c = byId.get(it.id);
        if (!c) {
          console.log(`  ! no classification returned for ${it.name} (${it.qty}) — left as-is`);
          return it;
        }
        console.log(
          `  ${it.name.padEnd(14)} ${it.qty.padEnd(12)} -> scalable=${c.scalable}` +
            (c.scalable ? ` baseAmount=${c.baseAmount} unit=${c.unit}` : "")
        );
        return {
          ...it,
          scalable: c.scalable,
          baseAmount: c.baseAmount ?? null,
          unit: c.unit ?? null,
        };
      }),
    }));

    if (APPLY) {
      const { error: updateError } = await supabase
        .from("recipes")
        .update({ ingredient_groups: updatedGroups })
        .eq("id", recipe.id);
      if (updateError) {
        console.error(`  ✗ failed to update: ${updateError.message}`);
      } else {
        console.log("  ✓ updated");
      }
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
