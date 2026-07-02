import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { completeRecipe } from "@/lib/anthropic";
import { logError } from "@/lib/errorLog";

export async function POST(request: NextRequest) {
  const { rawText } = await request.json();
  if (!rawText || typeof rawText !== "string") {
    return NextResponse.json({ error: "rawText is required" }, { status: 400 });
  }

  try {
    const recipe = await completeRecipe(rawText);

    if (!recipe.title?.trim()) {
      await logError("POST /api/recipes/draft", new Error("AI response missing title"), { recipe });
      return NextResponse.json(
        { error: "AIの応答にタイトルが含まれていませんでした。もう一度お試しください。" },
        { status: 502 }
      );
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    await logError("POST /api/recipes/draft", error);
    const message = error instanceof Error ? error.message : "レシピの補完に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
