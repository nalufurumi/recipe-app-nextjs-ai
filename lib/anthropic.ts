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
    title: {
      type: "string",
      maxLength: 24,
      description:
        "装飾表現を含まない、20文字前後のシンプルな料理名(例: 'トマトチキンライス')。" +
        "コンセプトやキャッチコピーはここに含めず description に回す",
    },
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
                qty: {
                  type: "string",
                  description: "表示用テキスト。今まで通り '200g' '1/2本' '少々' などをそのまま入れる",
                },
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
              required: ["id", "name", "qty", "scalable"],
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
    max_tokens: 8192,
    system:
      "重要: title は必ず装飾表現を含まない20文字前後のシンプルな料理名にしてください" +
      "(例: 「三つ星ホテル風トマトチキンライス ― 至高の一皿」ではなく「トマトチキンライス」)。" +
      "「Less is More」のようなコンセプトやキャッチコピー、副題は title に絶対に含めず、" +
      "description の冒頭にサブタイトルのように含めてください。\n\n" +
      "あなたは日本語の料理レシピアシスタントです。断片的・不完全なレシピ文章を受け取り、" +
      "欠けている情報(分量・手順・人数・調理時間・難易度など)を一般的な家庭料理の常識に基づいて補い、" +
      "完全な構造化レシピを submit_recipe ツールで返してください。補った箇所は assumptions に列挙してください。\n\n" +
      "各材料には、人数に応じた分量スケーリングのための情報も付けてください: " +
      "qtyが「200g」「2本」「大さじ1」のような具体的な数値+単位として解釈できる場合は scalable: true とし、" +
      "baseAmount にその数値、unit にその単位を入れてください。" +
      "一方「少々」「お好みで」「適量」「1/2本(お好みで調整)」のように曖昧・非数値的な表現は、" +
      "無理に数値化せず scalable: false とし、baseAmount と unit は null にしてください。",
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
