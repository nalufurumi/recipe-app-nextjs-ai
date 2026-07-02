import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { logError } from "@/lib/errorLog";
import type { Recipe, StructuredRecipe, ChefCheck } from "@/lib/types";

function rowToRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    servings: row.servings as string,
    time: row.time as string,
    level: row.level as string,
    ingredientGroups: row.ingredient_groups as Recipe["ingredientGroups"],
    steps: row.steps as Recipe["steps"],
    tips: row.tips as Recipe["tips"],
    assumptions: [],
    raw_input: row.raw_input as string,
    chef_check: (row.chef_check as ChefCheck | null) ?? null,
    created_at: row.created_at as string,
  };
}

export async function GET() {
  const { data, error } = await supabaseServer()
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    await logError("GET /api/recipes", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ recipes: (data ?? []).map(rowToRecipe) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    recipe: StructuredRecipe;
    rawInput: string;
    chefCheck: ChefCheck | null;
  };

  if (!body.recipe?.title?.trim()) {
    await logError("POST /api/recipes", new Error("missing title"), { body });
    return NextResponse.json({ error: "タイトルが空のため保存できません" }, { status: 400 });
  }

  const { data, error } = await supabaseServer()
    .from("recipes")
    .insert({
      title: body.recipe.title,
      description: body.recipe.description,
      servings: body.recipe.servings,
      time: body.recipe.time,
      level: body.recipe.level,
      ingredient_groups: body.recipe.ingredientGroups,
      steps: body.recipe.steps,
      tips: body.recipe.tips,
      raw_input: body.rawInput,
      chef_check: body.chefCheck,
    })
    .select()
    .single();

  if (error) {
    await logError("POST /api/recipes", error, { body });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ recipe: rowToRecipe(data) });
}
