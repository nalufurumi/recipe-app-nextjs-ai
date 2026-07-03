import Image from "next/image";
import Nalu from "./Nalu";

const FLOW_STEPS = [
  { label: "ラフに投稿", sub: "思いつきをそのまま" },
  { label: "なるしぇふが審査", sub: "AIシェフの目" },
  { label: "磨き上げ", sub: "言葉と手順を整える" },
  { label: "みんなに公開", sub: "今すぐ見られる", highlight: true },
];

export default function LandingPage() {
  return (
    <div className="home-screen page-container">
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <Nalu state="avatarOk" size={40} />
          <span className="landing-nav-logo">みんなのレシピ</span>
        </div>
        <div className="landing-nav-right">
          <a className="landing-nav-link" href="/how-it-works">
            使い方
          </a>
          <a className="landing-nav-cta" href="/recipes">
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
            <a className="landing-cta-primary" href="/recipes">
              みんなのレシピを見る <span className="landing-cta-arrow">→</span>
            </a>
            <a className="landing-cta-secondary" href="/login">
              投稿する
            </a>
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
            <Image src="/nalu/nalu-normal.png" alt="" fill sizes="300px" style={{ objectFit: "contain" }} />
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
    </div>
  );
}
