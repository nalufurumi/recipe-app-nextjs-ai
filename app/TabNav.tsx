import Link from "next/link";

export default function TabNav({ active }: { active: "home" | "upload" }) {
  return (
    <div className="tab-nav">
      <Link href="/" className={`tab-nav-item ${active === "home" ? "active" : ""}`}>
        レシピ
      </Link>
      <Link href="/upload" className={`tab-nav-item ${active === "upload" ? "active" : ""}`}>
        レシピ作成
      </Link>
    </div>
  );
}
