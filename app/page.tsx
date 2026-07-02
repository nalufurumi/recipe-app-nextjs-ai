import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import type { Recipe, ChefCheck } from "@/lib/types";
import TabNav from "./TabNav";
import Nalu from "./Nalu";

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
    <div className="home-screen page-container">
      <div className="home-hero">
        <div className="home-hero-top">
          <div>
            <div className="hero-kicker home-hero-kicker">MY RECIPE BOOK</div>
            <h1 className="home-hero-title">レシピ本</h1>
          </div>
          <Nalu state="avatarOk" size={64} />
        </div>
      </div>

      <div className="app-tabnav-wrap">
        <TabNav active="home" />
      </div>

      <div className="home-list-wrap">
        {recipes.length === 0 ? (
          <div className="empty-state">
            <Nalu state="normal" size={88} />
            <p>まだレシピがありません。「レシピ作成」タブから最初の一品を。</p>
          </div>
        ) : (
          <div className="home-list">
            {recipes.map((r) => (
              <Link className="home-card" key={r.id} href={`/recipes/${r.id}`}>
                <div className="home-card-spine" />
                <div className="home-card-body">
                  <h2>{r.title}</h2>
                  <div className="home-card-meta">
                    <span>{r.servings}</span>
                    <span>{r.time}</span>
                    <span>{r.level}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
