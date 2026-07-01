import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { completeRecipe } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  const { rawText } = await request.json();
  if (!rawText || typeof rawText !== "string") {
    return NextResponse.json({ error: "rawText is required" }, { status: 400 });
  }

  const recipe = await completeRecipe(rawText);
  return NextResponse.json({ recipe });
}
