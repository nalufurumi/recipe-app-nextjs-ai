"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChefCheck, StructuredRecipe } from "@/lib/types";
import TabNav from "../TabNav";

export default function UploadPage() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [recipe, setRecipe] = useState<StructuredRecipe | null>(null);
  const [check, setCheck] = useState<ChefCheck | null>(null);
  const [stage, setStage] = useState<"idle" | "completing" | "checking" | "saving">("idle");
  const [error, setError] = useState("");

  async function handleComplete() {
    setError("");
    setRecipe(null);
    setCheck(null);
    setStage("completing");

    try {
      const draftRes = await fetch("/api/recipes/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      if (!draftRes.ok) throw new Error("レシピの補完に失敗しました");
      const { recipe: completed } = await draftRes.json();
      setRecipe(completed);

      setStage("checking");
      const checkRes = await fetch("/api/recipes/chef-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completed),
      });
      if (!checkRes.ok) throw new Error("シェフAIのチェックに失敗しました");
      const { chefCheck: result } = await checkRes.json();
      setCheck(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setStage("idle");
    }
  }

  async function handleSave() {
    if (!recipe) return;
    setStage("saving");
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe, rawInput: rawText, chefCheck: check }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      const { recipe: saved } = await res.json();
      router.push(`/recipes/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setStage("idle");
    }
  }

  return (
    <div className="upload-page">
      <TabNav active="upload" />
      <div className="upload-inner">
        <h1>レシピを追加</h1>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="断片的なレシピ文章を貼り付けてください。材料や分量、手順が多少抜けていてもAIが補完します。"
        />
        <div className="upload-actions">
          <button
            className="btn btn-primary"
            onClick={handleComplete}
            disabled={!rawText.trim() || stage !== "idle"}
          >
            {stage === "completing"
              ? "AIが補完中..."
              : stage === "checking"
                ? "シェフAIがチェック中..."
                : "AIで完成させる"}
          </button>
        </div>

        {error && <div className="chef-check warn"><h3>{error}</h3></div>}

        {recipe && (
          <div className="preview-card">
            <h2>{recipe.title}</h2>
            <p>{recipe.description}</p>
            <div className="meta" style={{ marginTop: 12, display: "flex", gap: 14, fontSize: 12, color: "#A79C89" }}>
              <span>{recipe.servings}</span>
              <span>{recipe.time}</span>
              <span>{recipe.level}</span>
            </div>
            {recipe.assumptions.length > 0 && (
              <div className="assumptions">
                補完した箇所: {recipe.assumptions.join(" / ")}
              </div>
            )}
          </div>
        )}

        {check && (
          <div className={`chef-check ${check.feasible ? "ok" : "warn"}`}>
            <h3>{check.feasible ? "シェフAI: このレシピは作れます" : "シェフAI: 要確認"}</h3>
            {check.issues.length > 0 && (
              <ul>
                {check.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            )}
            {check.suggestions.length > 0 && (
              <ul>
                {check.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {recipe && (
          <div className="upload-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={stage !== "idle"}>
              {stage === "saving" ? "保存中..." : "レシピ本に保存する"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
