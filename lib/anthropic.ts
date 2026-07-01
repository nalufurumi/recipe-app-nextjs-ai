import Anthropic from "@anthropic-ai/sdk";
import type { ChefCheck, StructuredRecipe } from "./types";

const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

function anthropicClient() {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  client = new Anthropic({ apiKey });
  return client;
}

function extractToolInput<T>(message: Anthropic.Message, toolName: string): T {
  const block = message.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === toolName
  );
  if (!block) throw new Error(`Claude did not call the ${toolName} tool`);
  return block.input as T;
}

const RECIPE_SCHEMA: Anthropic.Tool.InputSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    servings: { type: "string" },
    time: { type: "string" },
    level: { type: "string" },
    ingredientGroups: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                qty: { type: "string" },
              },
              required: ["id", "name", "qty"],
            },
          },
        },
        required: ["name", "items"],
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          n: { type: "integer" },
          title: { type: "string" },
          body: { type: "string" },
        },
        required: ["n", "title", "body"],
      },
    },
    tips: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          items: { type: "array", items: { type: "string" } },
        },
        required: ["title", "items"],
      },
    },
    assumptions: {
      type: "array",
      items: { type: "string" },
      description: "Any missing details you filled in with a reasonable assumption",
    },
  },
  required: [
    "title",
    "description",
    "servings",
    "time",
    "level",
    "ingredientGroups",
    "steps",
    "tips",
    "assumptions",
  ],
};

export async function completeRecipe(rawText: string): Promise<StructuredRecipe> {
  const message = await anthropicClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "あなたは日本語の料理レシピアシスタントです。断片的・不完全なレシピ文章を受け取り、" +
      "欠けている情報(分量・手順・人数・調理時間・難易度など)を一般的な家庭料理の常識に基づいて補い、" +
      "完全な構造化レシピを submit_recipe ツールで返してください。補った箇所は assumptions に列挙してください。",
    messages: [{ role: "user", content: rawText }],
    tools: [
      {
        name: "submit_recipe",
        description: "補完済みの構造化レシピを送信する",
        input_schema: RECIPE_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "submit_recipe" },
  });

  return extractToolInput<StructuredRecipe>(message, "submit_recipe");
}

const CHECK_SCHEMA: Anthropic.Tool.InputSchema = {
  type: "object",
  properties: {
    feasible: { type: "boolean" },
    issues: { type: "array", items: { type: "string" } },
    suggestions: { type: "array", items: { type: "string" } },
  },
  required: ["feasible", "issues", "suggestions"],
};

export async function chefCheck(recipe: StructuredRecipe): Promise<ChefCheck> {
  const message = await anthropicClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system:
      "あなたはプロのシェフです。渡された構造化レシピ(材料・手順)を読み、" +
      "その手順通りに調理すれば実際に完成するかを検証してください。" +
      "材料と手順の整合性、抜けている調理工程、火加減や時間の妥当性を確認し、" +
      "submit_check ツールで判定を返してください。",
    messages: [{ role: "user", content: JSON.stringify(recipe) }],
    tools: [
      {
        name: "submit_check",
        description: "レシピの実現可能性の判定を送信する",
        input_schema: CHECK_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "submit_check" },
  });

  return extractToolInput<ChefCheck>(message, "submit_check");
}
