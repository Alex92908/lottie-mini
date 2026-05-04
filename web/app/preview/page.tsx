"use client";
import Link from "next/link";
import { useLang } from "../../lib/LangContext";
import LottiePreview from "./LottiePlayer";

export default function PreviewPage() {
  const { lang, toggle } = useLang();

  const t = {
    en: {
      back: "← Back",
      title: "Lottie Preview",
      sub: "Drop your before & after files side-by-side. Runs 100% in your browser — nothing is uploaded.",
      tip: "Tip: use the Balanced preset in lottie-mini, then compare the two files here.",
    },
    zh: {
      back: "← 返回",
      title: "Lottie 在线预览",
      sub: "把压缩前后的文件并排拖入，直观对比效果。完全在浏览器本地运行，不上传任何数据。",
      tip: "提示：用 lottie-mini 的「均衡」预设压缩，然后把两个文件拖入左右对比。",
    },
  }[lang];

  return (
    <>
      <nav>
        <div className="nav-inner">
          <span className="nav-logo">
            lottie<span>-mini</span>
          </span>
          <div className="nav-links">
            <Link href="/">{t.back}</Link>
            <button className="lang-toggle" onClick={toggle}>
              {lang === "en" ? "中文" : "EN"}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
          <div style={{ padding: "48px 0 32px", textAlign: "center" }}>
            <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
              {t.title}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 520, margin: "0 auto 12px" }}>
              {t.sub}
            </p>
            <p style={{ color: "var(--accent2)", fontSize: 13 }}>{t.tip}</p>
          </div>

          <LottiePreview lang={lang} />
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 0", textAlign: "center" }}>
        <div className="container" style={{ color: "var(--muted)", fontSize: 13 }}>
          lottie-mini · MIT ·{" "}
          <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
