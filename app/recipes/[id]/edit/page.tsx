import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import type { Recipe, ChefCheck } from "@/lib/types";
import EditScreen from "./EditScreen";

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

export default async function RecipeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!(await isAuthenticated())) {
    redirect(`/recipes/${id}`);
  }

  const { data, error } = await supabaseServer()
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return <EditScreen recipe={rowToRecipe(data)} />;
}
