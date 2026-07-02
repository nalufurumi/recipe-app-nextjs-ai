"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe, StructuredRecipe, IngredientGroup, Step, Tip } from "@/lib/types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function toDraft(recipe: Recipe): StructuredRecipe {
  return {
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    time: recipe.time,
    level: recipe.level,
    ingredientGroups: recipe.ingredientGroups,
    steps: recipe.steps,
    tips: recipe.tips,
    assumptions: [],
  };
}

export default function EditScreen({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [mode, setMode] = useState<"direct" | "regenerate">("direct");
  const [draft, setDraft] = useState<StructuredRecipe>(() => toDraft(recipe));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof StructuredRecipe>(key: K, value: StructuredRecipe[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateGroups(groups: IngredientGroup[]) {
    update("ingredientGroups", groups);
  }

  function addGroup() {
    updateGroups([...draft.ingredientGroups, { name: "新しいグループ", items: [] }]);
  }

  function removeGroup(gi: number) {
    updateGroups(draft.ingredientGroups.filter((_, i) => i !== gi));
  }

  function updateGroupName(gi: number, name: string) {
    updateGroups(draft.ingredientGroups.map((g, i) => (i === gi ? { ...g, name } : g)));
  }

  function addItem(gi: number) {
    updateGroups(
      draft.ingredientGroups.map((g, i) =>
        i === gi ? { ...g, items: [...g.items, { id: newId(), name: "", qty: "" }] } : g
      )
    );
  }

  function removeItem(gi: number, ii: number) {
    updateGroups(
      draft.ingredientGroups.map((g, i) =>
        i === gi ? { ...g, items: g.items.filter((_, j) => j !== ii) } : g
      )
    );
  }

  function updateItem(gi: number, ii: number, field: "name" | "qty", value: string) {
    updateGroups(
      draft.ingredientGroups.map((g, i) =>
        i === gi
          ? { ...g, items: g.items.map((it, j) => (j === ii ? { ...it, [field]: value } : it)) }
          : g
      )
    );
  }

  function updateSteps(steps: Step[]) {
    update("steps", steps);
  }

  function addStep() {
    updateSteps([...draft.steps, { n: draft.steps.length + 1, title: "", body: "" }]);
  }

  function removeStep(si: number) {
    updateSteps(draft.steps.filter((_, i) => i !== si).map((s, i) => ({ ...s, n: i + 1 })));
  }

  function updateStep(si: number, field: "title" | "body", value: string) {
    updateSteps(draft.steps.map((s, i) => (i === si ? { ...s, [field]: value } : s)));
  }

  function updateTips(tips: Tip[]) {
    update("tips", tips);
  }

  function addTip() {
    updateTips([...draft.tips, { title: "新しいコツ", items: [] }]);
  }

  function removeTip(ti: number) {
    updateTips(draft.tips.filter((_, i) => i !== ti));
  }

  function updateTipTitle(ti: number, value: string) {
    updateTips(draft.tips.map((t, i) => (i === ti ? { ...t, title: value } : t)));
  }

  function addTipItem(ti: number) {
    updateTips(draft.tips.map((t, i) => (i === ti ? { ...t, items: [...t.items, ""] } : t)));
  }

  function removeTipItem(ti: number, ii: number) {
    updateTips(
      draft.tips.map((t, i) => (i === ti ? { ...t, items: t.items.filter((_, j) => j !== ii) } : t))
    );
  }

  function updateTipItem(ti: number, ii: number, value: string) {
    updateTips(
      draft.tips.map((t, i) =>
        i === ti ? { ...t, items: t.items.map((it, j) => (j === ii ? value : it)) } : t
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: draft }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ? `保存に失敗しました: ${body.error}` : "保存に失敗しました");
      }
      router.push(`/recipes/${recipe.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setSaving(false);
    }
  }

  return (
    <div className="upload-screen page-container">
      <div className="upload-hero">
        <div className="upload-hero-top">
          <div>
            <div className="hero-kicker upload-hero-kicker">EDIT RECIPE</div>
            <h1 className="upload-hero-title">レシピを編集</h1>
          </div>
        </div>
      </div>

      <div className="upload-inner">
        <div className="edit-mode-tabs">
          <button
            className={`edit-mode-tab ${mode === "direct" ? "active" : ""}`}
            onClick={() => setMode("direct")}
          >
            直接編集
          </button>
          <button
            className={`edit-mode-tab ${mode === "regenerate" ? "active" : ""}`}
            onClick={() => setMode("regenerate")}
            disabled
            title="準備中"
          >
            AI再生成(準備中)
          </button>
        </div>

        {mode === "direct" && (
          <>
            <div className="field">
              <label>タイトル</label>
              <input value={draft.title} onChange={(e) => update("title", e.target.value)} />
            </div>

            <div className="field">
              <label>説明</label>
              <textarea
                value={draft.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>人数</label>
                <input value={draft.servings} onChange={(e) => update("servings", e.target.value)} />
              </div>
              <div className="field">
                <label>時間</label>
                <input value={draft.time} onChange={(e) => update("time", e.target.value)} />
              </div>
              <div className="field">
                <label>難易度</label>
                <input value={draft.level} onChange={(e) => update("level", e.target.value)} />
              </div>
            </div>

            <h2 className="edit-section-title">材料</h2>
            {draft.ingredientGroups.map((group, gi) => (
              <div className="edit-group" key={gi}>
                <div className="edit-group-header">
                  <input value={group.name} onChange={(e) => updateGroupName(gi, e.target.value)} />
                  <button className="icon-btn" onClick={() => removeGroup(gi)} aria-label="グループを削除">
                    ×
                  </button>
                </div>
                {group.items.map((item, ii) => (
                  <div className="edit-item-row" key={item.id}>
                    <input
                      placeholder="材料名"
                      value={item.name}
                      onChange={(e) => updateItem(gi, ii, "name", e.target.value)}
                    />
                    <input
                      placeholder="分量"
                      value={item.qty}
                      onChange={(e) => updateItem(gi, ii, "qty", e.target.value)}
                    />
                    <button className="icon-btn" onClick={() => removeItem(gi, ii)} aria-label="材料を削除">
                      ×
                    </button>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addItem(gi)}>
                  + 材料を追加
                </button>
              </div>
            ))}
            <button className="add-btn" onClick={addGroup}>
              + グループを追加
            </button>

            <h2 className="edit-section-title">作り方</h2>
            {draft.steps.map((step, si) => (
              <div className="edit-step" key={si}>
                <div className="edit-row-header">
                  <input
                    placeholder="手順タイトル"
                    value={step.title}
                    onChange={(e) => updateStep(si, "title", e.target.value)}
                  />
                  <button className="icon-btn" onClick={() => removeStep(si)} aria-label="手順を削除">
                    ×
                  </button>
                </div>
                <textarea
                  placeholder="手順の内容"
                  value={step.body}
                  onChange={(e) => updateStep(si, "body", e.target.value)}
                  rows={3}
                />
              </div>
            ))}
            <button className="add-btn" onClick={addStep}>
              + 手順を追加
            </button>

            <h2 className="edit-section-title">コツ</h2>
            {draft.tips.map((tip, ti) => (
              <div className="edit-tip" key={ti}>
                <div className="edit-row-header">
                  <input value={tip.title} onChange={(e) => updateTipTitle(ti, e.target.value)} />
                  <button className="icon-btn" onClick={() => removeTip(ti)} aria-label="コツを削除">
                    ×
                  </button>
                </div>
                {tip.items.map((line, ii) => (
                  <div className="edit-item-row" key={ii}>
                    <input value={line} onChange={(e) => updateTipItem(ti, ii, e.target.value)} />
                    <button className="icon-btn" onClick={() => removeTipItem(ti, ii)} aria-label="項目を削除">
                      ×
                    </button>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addTipItem(ti)}>
                  + 項目を追加
                </button>
              </div>
            ))}
            <button className="add-btn" onClick={addTip}>
              + コツを追加
            </button>

            {error && <div className="edit-error">{error}</div>}

            <div className="upload-actions">
              <button className="btn btn-secondary" onClick={() => router.push(`/recipes/${recipe.id}`)}>
                キャンセル
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "保存中..." : "保存する"}
              </button>
            </div>
          </>
        )}

        {mode === "regenerate" && (
          <p style={{ color: "#A79C89", fontSize: 13.5 }}>
            AI再生成は準備中です。しばらくお待ちください。
          </p>
        )}
      </div>
    </div>
  );
}
