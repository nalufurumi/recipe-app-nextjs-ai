import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import type { Recipe, ChefCheck } from "@/lib/types";

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
  };
}

export default async function HomePage() {
  const { data } = await supabaseServer()
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  const recipes = (data ?? []).map(rowToRecipe);

  return (
    <div className="home">
      <div className="home-header">
        <div>
          <div className="kicker">MY RECIPE BOOK</div>
          <h1>レシピ本</h1>
        </div>
        <Link className="upload-link" href="/upload">
          + レシピを追加
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="empty-state">まだレシピがありません。「+ レシピを追加」から最初の一品を。</div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((r) => (
            <Link className="recipe-card" key={r.id} href={`/recipes/${r.id}`}>
              <div className="kicker">RECIPE</div>
              <h2>{r.title}</h2>
              <p>{r.description}</p>
              <div className="meta">
                <span>{r.servings}</span>
                <span>{r.time}</span>
                <span>{r.level}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
