"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/types";

type Tab = "ing" | "steps" | "tips";

export default function RecipeScreen({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ing");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [cooking, setCooking] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const lastStep = recipe.steps.length - 1;
  const isFinalStep = cooking && stepIndex >= lastStep;

  useEffect(() => {
    if (!cooking) return;
    stepRefs.current[stepIndex]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [cooking, stepIndex]);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleForwardClick() {
    if (!cooking) {
      setCooking(true);
      setStepIndex(0);
      setTab("steps");
    } else if (isFinalStep) {
      setCooking(false);
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
    </div>
  );
}
