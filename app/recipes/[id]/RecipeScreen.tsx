"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/types";

type Tab = "ing" | "steps" | "tips";

export default function RecipeScreen({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ing");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="screen">
      <div className="hero">
        <div className="hero-topbar">
          <button className="round-btn" onClick={() => router.push("/")} aria-label="戻る">
            ‹
          </button>
        </div>
        <div className="hero-title">
          <div className="hero-kicker">RECIPE</div>
          <div className="hero-name">{recipe.title}</div>
        </div>
      </div>

      <div className="sheet">
        <div className="sheet-inner">
          <p className="lede">{recipe.description}</p>

          <div className="chips">
            <div className="chip">
              <div className="chip-label">SERVES</div>
              <div className="chip-value">{recipe.servings}</div>
            </div>
            <div className="chip">
              <div className="chip-label">TIME</div>
              <div className="chip-value">{recipe.time}</div>
            </div>
            <div className="chip">
              <div className="chip-label">LEVEL</div>
              <div className="chip-value">{recipe.level}</div>
            </div>
          </div>

          <div className="segmented">
            <button className={`seg-btn ${tab === "ing" ? "active" : ""}`} onClick={() => setTab("ing")}>
              材料
            </button>
            <button className={`seg-btn ${tab === "steps" ? "active" : ""}`} onClick={() => setTab("steps")}>
              作り方
            </button>
            <button className={`seg-btn ${tab === "tips" ? "active" : ""}`} onClick={() => setTab("tips")}>
              コツ
            </button>
          </div>

          <div className={`panel ${tab !== "ing" ? "hidden" : ""}`}>
            <div className="hint">タップでチェックできます</div>
            {recipe.ingredientGroups.map((group) => (
              <div className="group" key={group.name}>
                <div className="group-name">{group.name}</div>
                {group.items.map((item) => {
                  const on = !!checked[item.id];
                  return (
                    <div
                      className={`item-row ${on ? "checked" : ""}`}
                      key={item.id}
                      onClick={() => toggle(item.id)}
                    >
                      <div className="item-dot">{on ? "✓" : ""}</div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-qty">{item.qty}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className={`panel ${tab !== "steps" ? "hidden" : ""}`}>
            {recipe.steps.map((step) => (
              <div className="step" key={step.n}>
                <div className="step-num">{step.n}</div>
                <div>
                  <div className="step-title">{step.title}</div>
                  <p className="step-body">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`panel ${tab !== "tips" ? "hidden" : ""}`} data-panel="tips">
            {recipe.tips.map((tip) => (
              <div className="note" key={tip.title}>
                <div className="note-title">{tip.title}</div>
                <ul>
                  {tip.items.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cta-bar">
        <button className="cta-btn" onClick={() => setTab("steps")}>
          <span className="cta-icon">◷</span> 調理をはじめる
        </button>
      </div>
    </div>
  );
}
