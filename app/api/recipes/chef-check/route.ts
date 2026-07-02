import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { chefCheck } from "@/lib/anthropic";
import { logError } from "@/lib/errorLog";
import type { StructuredRecipe } from "@/lib/types";

export async function POST(request: NextRequest) {
  const recipe = (await request.json()) as StructuredRecipe;

  try {
    const result = await chefCheck(recipe);
    return NextResponse.json({ chefCheck: result });
  } catch (error) {
    await logError("POST /api/recipes/chef-check", error);
    const message = error instanceof Error ? error.message : "シェフAIのチェックに失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
