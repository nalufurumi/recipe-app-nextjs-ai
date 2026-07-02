"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { IngredientItem, Recipe } from "@/lib/types";
import Nalu from "../../Nalu";

type Tab = "ing" | "steps" | "tips";

function parseServingsNumber(text: string): number | null {
  const match = text.match(/\d+(\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function displayQty(item: IngredientItem, baseServings: number | null, servings: number): string {
  if (!item.scalable || item.baseAmount == null || baseServings === null) return item.qty;
  const scaled = item.baseAmount * (servings / baseServings);
  const rounded = Math.round(scaled * 10) / 10;
  const numText = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${numText}${item.unit ?? ""}`;
}

export default function RecipeScreen({
  recipe,
  editable = false,
}: {
  recipe: Recipe;
  editable?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ing");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [cooking, setCooking] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const celebrateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseServings = parseServingsNumber(recipe.servings);
  const [servings, setServings] = useState(baseServings ?? 1);

  const lastStep = recipe.steps.length - 1;
  const isFinalStep = cooking && stepIndex >= lastStep;

  useEffect(() => {
    if (!cooking) return;
    stepRefs.current[stepIndex]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [cooking, stepIndex]);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function endCooking() {
    if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current);
    setCelebrating(false);
    setCooking(false);
  }

  function handleForwardClick() {
    if (!cooking) {
      setCooking(true);
      setStepIndex(0);
      setTab("steps");
    } else if (isFinalStep) {
      setCelebrating(true);
      celebrateTimeoutRef.current = setTimeout(endCooking, 1800);
    } else {
      setStepIndex((i) => Math.min(i + 1, lastStep));
    }
  }

  function handleBackClick() {
    if (!cooking || stepIndex === 0) return;
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="screen page-container">
      {cooking && !celebrating && (
        <div className="nalu-preload" aria-hidden="true">
          <Nalu state="happy" size={160} />
        </div>
      )}

      <div className="hero">
        <div className="hero-topbar">
          <button className="round-btn" onClick={() => router.push("/")} aria-label="戻る">
            ‹
          </button>
          {editable && (
            <button
              className="round-btn"
              onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
              aria-label="編集"
            >
              ✎
            </button>
          )}
        </div>
        <div className="hero-title">
          <div className="hero-kicker">RECIPE</div>
          <div className="hero-name">{recipe.title}</div>
        </div>
      </div>

      <div className="sheet">
        <div className="sheet-inner">
          <p className="lede">{recipe.description}</p>
          <p className="posted-by">投稿者: Nalu</p>

          <div className="chips">
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

            {baseServings !== null && (
              <div className="servings-stepper">
                <span className="servings-stepper-label">人数</span>
                <div className="servings-stepper-control">
                  <button
                    className="stepper-btn"
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    aria-label="人数を減らす"
                  >
                    −
                  </button>
                  <span className="servings-stepper-value">{servings}人前</span>
                  <button
                    className="stepper-btn"
                    onClick={() => setServings((s) => Math.min(20, s + 1))}
                    aria-label="人数を増やす"
                  >
                    ＋
                  </button>
                </div>
              </div>
            )}

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
                      <div className="item-qty">{displayQty(item, baseServings, servings)}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className={`panel ${tab !== "steps" ? "hidden" : ""}`}>
            {recipe.steps.map((step, i) => {
              const isActive = cooking && i === stepIndex;
              const isDone = cooking && i < stepIndex;
              const isDimmed = cooking && !isActive;
              return (
                <div
                  className={`step ${isActive ? "active" : ""} ${isDimmed ? "dimmed" : ""}`}
                  key={step.n}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                >
                  <div className="step-num">{isDone ? "✓" : step.n}</div>
                  <div>
                    <div className="step-title">{step.title}</div>
                    <p className="step-body">{step.body}</p>
                  </div>
                </div>
              );
            })}
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
        {cooking ? (
          <div className="cta-row">
            <button className="cta-btn cta-btn-back" onClick={handleBackClick} disabled={stepIndex === 0}>
              戻る
            </button>
            <button className="cta-btn cta-btn-forward" onClick={handleForwardClick}>
              <span className="cta-icon">{isFinalStep ? "🎉" : "◷"}</span>
              {isFinalStep ? "完成！" : "次に進む"}
            </button>
          </div>
        ) : (
          <button className="cta-btn" onClick={handleForwardClick}>
            <span className="cta-icon">◷</span> 調理をはじめる
          </button>
        )}
      </div>

      {celebrating && (
        <div className="celebrate-overlay" onClick={endCooking}>
          <div className="celebrate-avatar-wrap">
            <span className="sparkle sparkle-1">✨</span>
            <span className="sparkle sparkle-2">✨</span>
            <span className="sparkle sparkle-3">✨</span>
            <span className="sparkle sparkle-4">✨</span>
            <Nalu state="happy" size={160} />
          </div>
          <p>
            よくできました！
            <br />
            お疲れさまでした！
          </p>
        </div>
      )}
    </div>
  );
}
