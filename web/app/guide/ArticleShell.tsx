"use client";
import Link from "next/link";
import { useLang } from "../../lib/LangContext";
import { CarbonAd } from "../../components/CarbonAd";
import { GoogleAd } from "../../components/GoogleAd";

export default function ArticleShell({ children }: { children: React.ReactNode }) {
  const { lang, toggle } = useLang();
  const back = lang === "en" ? "← Back to Guide" : "← 返回指南";

  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link href="/" style={{ display: "block" }}>
            <img src="/logo-text.svg" alt="lottie-mini" height={36} style={{ display: "block" }} />
          </Link>
          <div className="nav-links">
            <Link href="/guide">{back}</Link>
            <button className="lang-toggle" onClick={toggle}>
              {lang === "en" ? "中文" : "EN"}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
          <article className="page-prose">
            {children}
          </article>

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

export function useArticleLang() {
  return useLang();
}
