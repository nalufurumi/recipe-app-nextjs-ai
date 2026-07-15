import Link from "next/link";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import type { Recipe, ChefCheck } from "@/lib/types";
import TabNav from "../TabNav";
import Nalu from "../Nalu";

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

export default async function RecipeListPage() {
  const { data } = await supabaseServer()
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  const recipes = (data ?? []).map(rowToRecipe);
  const authed = await isAuthenticated();

  return (
    <div className="home-screen page-container">
      <div className="app-tabnav-wrap">
        <TabNav active="home" authed={authed} />
      </div>

      {recipes.length > 0 && (
        <div className="home-greeting">
          <Nalu state="ok" size={52} bob />
          <div className="home-greeting-copy">
            <div className="home-greeting-title">こんにちは。今日はどれを作ろうか。</div>
            <div className="home-greeting-sub">全 {recipes.length} 品を、なるしぇふが磨き上げ済み</div>
          </div>
        </div>
      )}

      <div className="home-list-wrap">
        {recipes.length === 0 ? (
          <div className="empty-state">
            <Nalu state="thinking" size={88} />
            <p>まだレシピがありません。「レシピ作成」タブから最初の一品を。</p>
          </div>
        ) : (
          <div className="home-list">
            {recipes.map((r, i) => (
              <Link className="home-card" key={r.id} href={`/recipes/${r.id}`}>
                <div className={`home-card-photo ${r.image_url ? "" : `home-card-photo-${i % 5}`}`}>
                  {r.image_url && (
                    <Image
                      src={r.image_url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 110px, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  <span className={`home-card-level level-${levelTone(r.level)}`}>{levelLabel(r.level)}</span>
                  {r.chef_check?.feasible && (
                    <span className="home-card-checked">
                      <Nalu state="avatarOk" size={16} />
                      審査済み
                    </span>
                  )}
                </div>
                <div className="home-card-body">
                  <h2>{r.title}</h2>
                  <div className="home-card-meta">
                    <span>{r.time}</span>
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

function levelTone(level: string): "advanced" | "mid" | "easy" {
  if (level.includes("上級")) return "advanced";
  if (level.includes("初級")) return "easy";
  return "mid";
}

function levelLabel(level: string): string {
  if (level.includes("上級")) return "上級";
  if (level.includes("初級")) return "初級";
  if (level.includes("中級")) return "中級";
  return level;
}
