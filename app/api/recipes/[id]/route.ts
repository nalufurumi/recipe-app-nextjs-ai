import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
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
    image_url: (row.image_url as string | null) ?? null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabaseServer()
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ recipe: rowToRecipe(data) });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { recipe: StructuredRecipe };

  if (!body.recipe?.title?.trim()) {
    await logError("PUT /api/recipes/[id]", new Error("missing title"), { id, body });
    return NextResponse.json({ error: "タイトルが空のため保存できません" }, { status: 400 });
  }

  const { data, error } = await supabaseServer()
    .from("recipes")
    .update({
      title: body.recipe.title,
      description: body.recipe.description,
      servings: body.recipe.servings,
      time: body.recipe.time,
      level: body.recipe.level,
      ingredient_groups: body.recipe.ingredientGroups,
      steps: body.recipe.steps,
      tips: body.recipe.tips,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    await logError("PUT /api/recipes/[id]", error, { id, body });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ recipe: rowToRecipe(data) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabaseServer().from("recipes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
