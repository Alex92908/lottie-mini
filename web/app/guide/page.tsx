"use client";
import Link from "next/link";
import { useLang } from "../../lib/LangContext";
import { CarbonAd } from "../../components/CarbonAd";
import { GoogleAd } from "../../components/GoogleAd";

const T = {
  en: {
    back: "← Back",
    title: "Guide",
    sub: "Long-form articles on Lottie file size, the WebP/frame-skipping pipeline, and best practices for designers and developers shipping animations to production.",
    a1H: "Why your Lottie file is 70 MB",
    a1B: "The structural reason designer-exported Lottie files explode in size — embedded PNG frame sequences, base64 overhead, and why traditional vector optimizers can't help.",
    a1M: "8 min read",
    a2H: "Best practices for shipping Lottie",
    a2B: "Concrete rules of thumb for designers (how to export from After Effects), developers (how to integrate without bloat), and product managers (when to use Lottie vs MP4 or WebM).",
    a2M: "6 min read",
    a3H: "How the lottie-mini compressor works",
    a3B: "A technical walkthrough of the in-browser pipeline — PNG decode, WebP re-encode via libwebp.js, frame stride, and timeline rewriting — and why it stays 100% local.",
    a3M: "10 min read",
  },
  zh: {
    back: "← 返回",
    title: "使用指南",
    sub: "关于 Lottie 体积、WebP 抽帧压缩流水线,以及在生产环境交付动画的设计师和工程师最佳实践的深度长文。",
    a1H: "为什么你的 Lottie 文件有 70 MB",
    a1B: "设计师导出的 Lottie 体积爆炸的根本原因——内嵌 PNG 帧序列、base64 开销,以及传统矢量优化器为何无能为力。",
    a1M: "8 分钟阅读",
    a2H: "Lottie 上线最佳实践",
    a2B: "面向设计师(如何从 AE 正确导出)、开发者(如何不带来体积膨胀地集成)、产品经理(什么时候用 Lottie、什么时候用 MP4 或 WebM)的具体经验法则。",
    a2M: "6 分钟阅读",
    a3H: "lottie-mini 压缩工具的工作原理",
    a3B: "浏览器端压缩流水线的技术讲解——PNG 解码、通过 libwebp.js 重编码为 WebP、抽帧、时间轴重写——以及为什么能 100% 本地完成。",
    a3M: "10 分钟阅读",
  },
} as const;

export default function GuideIndexPage() {
  const { lang, toggle } = useLang();
  const t = T[lang];

  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link href="/" style={{ display: "block" }}>
            <img src="/logo-text.svg" alt="lottie-mini" height={36} style={{ display: "block" }} />
          </Link>
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
          <div style={{ padding: "48px 0 24px", textAlign: "center" }}>
            <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
              {t.title}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 620, margin: "0 auto" }}>{t.sub}</p>
          </div>

          <div className="guide-grid">
            <Link href="/guide/why-lottie-files-are-big" className="guide-card">
              <h3>{t.a1H}</h3>
              <p>{t.a1B}</p>
              <div className="guide-meta">{t.a1M}</div>
            </Link>
            <Link href="/guide/best-practices" className="guide-card">
              <h3>{t.a2H}</h3>
              <p>{t.a2B}</p>
              <div className="guide-meta">{t.a2M}</div>
            </Link>
            <Link href="/guide/how-it-works" className="guide-card">
              <h3>{t.a3H}</h3>
              <p>{t.a3B}</p>
              <div className="guide-meta">{t.a3M}</div>
            </Link>
          </div>

          <div className="ad-row">
            <CarbonAd />
            <GoogleAd />
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            lottie-mini ·{" "}
            <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </div>
      </footer>
    </>
  );
}
