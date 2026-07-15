import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import type { Recipe, ChefCheck } from "@/lib/types";
import RecipeScreen from "./RecipeScreen";

export const dynamic = "force-dynamic";

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

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await supabaseServer()
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const editable = await isAuthenticated();

  return <RecipeScreen recipe={rowToRecipe(data)} editable={editable} />;
}
