import Link from "next/link";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import type { Recipe, ChefCheck } from "@/lib/types";
import TabNav from "./TabNav";
import Nalu from "./Nalu";

const FLOW_STEPS = [
  { label: "ラフに投稿", sub: "近日解禁" },
  { label: "なるしぇふが審査", sub: "AIシェフの目" },
  { label: "磨き上げ", sub: "言葉と手順を整える" },
  { label: "みんなに公開", sub: "今すぐ見られる", highlight: true },
];

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
  const authed = await isAuthenticated();

  return (
    <div className="home-screen page-container">
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <Nalu state="avatarOk" size={40} />
          <span className="landing-nav-logo">みんなのレシピ</span>
        </div>
        <div className="landing-nav-right">
          <span className="landing-locked-pill">
            <span aria-hidden="true">🔒</span>投稿は近日公開
          </span>
          <span className="landing-nav-link">使い方</span>
          <a className="landing-nav-cta" href="#recipe-list">
            レシピを見る
          </a>
        </div>
      </nav>

      <div className="landing-hero">
        <div className="landing-hero-copy">
          <div className="hero-kicker landing-hero-kicker">EVERYONE&apos;S RECIPES, POLISHED BY AI</div>
          <h1 className="landing-hero-title">
            君の食卓は、
            <br />
            僕が彩る。
          </h1>
          <p className="landing-hero-subcopy">
            思いつきから生まれる、最高のレシピを。AIシェフ「なるしぇふ」が、審査してキラリと磨き上げます。
          </p>

          <div className="landing-cta-row">
            <a className="landing-cta-primary" href="#recipe-list">
              みんなのレシピを見る <span className="landing-cta-arrow">→</span>
            </a>
            <span className="landing-cta-locked">
              <span aria-hidden="true">🔒</span>投稿は近日公開
            </span>
          </div>

          <div className="landing-flow">
            {FLOW_STEPS.map((step, i) => (
              <div className="landing-flow-item" key={step.label}>
                {i > 0 && <span className="landing-flow-dash">―</span>}
                <div className={`landing-flow-step ${step.highlight ? "highlight" : ""}`}>
                  <div className="landing-flow-label">{step.label}</div>
                  <div className="landing-flow-sub">{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-character">
          <div className="landing-character-glow" />
          <div className="landing-character-figure">
            <Image src="/nalu/nalu-happy.png" alt="" fill sizes="300px" style={{ objectFit: "contain" }} />
          </div>
          <div className="landing-speech-bubble">「君のアイデア、僕がもっと輝かせてあげる」</div>
        </div>
      </div>

      <div className="landing-bottom-strip">
        <span>RAW IDEA</span>
        <span>AI REVIEW</span>
        <span>REFINED RECIPE</span>
        <span>SHARED DATABASE</span>
      </div>

      <div className="app-tabnav-wrap">
        <TabNav active="home" authed={authed} />
      </div>

      <div className="home-list-wrap" id="recipe-list">
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
