import Link from "next/link";

export default function TabNav({
  active,
  authed = true,
}: {
  active: "home" | "upload";
  authed?: boolean;
}) {
  return (
    <div className="tab-nav">
      <Link href="/recipes" className={`tab-nav-item ${active === "home" ? "active" : ""}`}>
        レシピ
      </Link>
      <Link
        href={authed ? "/upload" : "/login?next=/upload"}
        className={`tab-nav-item ${active === "upload" ? "active" : ""}`}
      >
        レシピ作成
      </Link>
    </div>
  );
}
