import Nalu from "../Nalu";

const HOWTO_STEPS = [
  {
    n: "01",
    title: "アイデアを気軽に投稿",
    body: "材料や手順が多少抜けていても大丈夫。思いついたことをそのまま書くだけでOKです。",
  },
  {
    n: "02",
    title: "なるしぇふが手順を補完",
    body: "分量や火加減、抜けている工程をAIシェフ「なるしぇふ」が家庭料理の常識に基づいて自然に埋めます。",
  },
  {
    n: "03",
    title: "実現可能かをチェック",
    body: "その手順どおりに作って本当に完成するか、材料と手順の整合性をAIが厳しくチェックします。",
  },
  {
    n: "04",
    title: "みんなに公開",
    body: "磨き上げられたレシピがレシピ一覧に並び、誰でもすぐに見られるようになります。",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="home-screen page-container">
      <nav className="landing-nav">
        <a className="landing-nav-brand" href="/">
          <Nalu state="avatarOk" size={40} />
          <span className="landing-nav-logo">みんなのレシピ</span>
        </a>
        <div className="landing-nav-right">
          <a className="landing-nav-link landing-nav-link-active" href="/how-it-works">
            使い方
          </a>
          <a className="landing-nav-cta" href="/recipes">
            レシピを見る
          </a>
        </div>
      </nav>

      <section className="landing-howto landing-howto-page">
        <div className="hero-kicker landing-howto-kicker">HOW IT WORKS</div>
        <h2 className="landing-howto-title">使い方</h2>
        <div className="landing-howto-grid">
          {HOWTO_STEPS.map((step) => (
            <div className="landing-howto-card" key={step.n}>
              <div className="landing-howto-num">{step.n}</div>
              <h3 className="landing-howto-card-title">{step.title}</h3>
              <p className="landing-howto-card-body">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-bottom-strip">
        <span>RAW IDEA</span>
        <span>AI REVIEW</span>
        <span>REFINED RECIPE</span>
        <span>SHARED DATABASE</span>
      </div>
    </div>
  );
}
