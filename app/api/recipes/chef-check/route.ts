import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { chefCheck } from "@/lib/anthropic";
import type { StructuredRecipe } from "@/lib/types";

export async function POST(request: NextRequest) {
  const recipe = (await request.json()) as StructuredRecipe;
  const result = await chefCheck(recipe);
  return NextResponse.json({ chefCheck: result });
}
