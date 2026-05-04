"use client";
import { useLang } from "../lib/LangContext";
import { strings } from "../lib/strings";
import Link from "next/link";

const GITHUB = "https://github.com/Alex92908/lottie-mini";

export default function Home() {
  const { lang, toggle } = useLang();
  const t = strings[lang];

  return (
    <>
      <nav>
        <div className="nav-inner">
          <span className="nav-logo">
            lottie<span>-mini</span>
          </span>
          <div className="nav-links">
            <a href="#how">{t.nav.how}</a>
            <a href="#install">{t.nav.install}</a>
            <Link href="/compress">{t.nav.compress}</Link>
            <Link href="/preview">{t.nav.preview}</Link>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">{t.nav.github}</a>
            <button className="lang-toggle" onClick={toggle}>
              {lang === "en" ? "中文" : "EN"}
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="hero container">
          <div className="hero-badge">{t.hero.badge}</div>
          <h1>
            {lang === "en" ? (
              <>{t.hero.h1a}<br />by <em>{t.hero.h1em}</em></>
            ) : (
              <>{t.hero.h1a}<br /><em>{t.hero.h1em}</em>{t.hero.h1b}</>
            )}
          </h1>
          <p>{t.hero.sub}</p>
          <div className="hero-btns">
            <a className="btn btn-primary" href="#install">{t.hero.cta}</a>
            <a className="btn btn-ghost" href={GITHUB} target="_blank" rel="noopener noreferrer">
              {t.hero.ghBtn}
            </a>
          </div>
        </section>

        <div className="container">
          {/* Screenshot — switches with language */}
          <div className="screenshot-wrap">
            <img
              src={lang === "zh" ? "/screenshot_zh.png" : "/screenshot_en.png"}
              alt="lottie-mini GUI screenshot"
              className="screenshot"
            />
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="stat">
              <div className="stat-value accent">{t.stats.ratio}</div>
              <div className="stat-label">{t.stats.ratioLabel}</div>
            </div>
            <div className="stat">
              <div className="stat-value green">{t.stats.size}</div>
              <div className="stat-label">{t.stats.sizeLabel}</div>
            </div>
            <div className="stat">
              <div className="stat-value">{t.stats.offline}</div>
              <div className="stat-label">{t.stats.offlineLabel}</div>
            </div>
          </div>

          {/* Before / After bar */}
          <div className="compare">
            <div className="compare-title">{t.compare.title}</div>
            <div className="compare-bars">
              <div className="bar-row">
                <div className="bar-label">{t.compare.before}</div>
                <div className="bar-track">
                  <div className="bar-fill before">70 MB PNG</div>
                </div>
                <div className="bar-size">70 MB</div>
              </div>
              <div className="bar-row">
                <div className="bar-label">{t.compare.after}</div>
                <div className="bar-track">
                  <div className="bar-fill after" />
                </div>
                <div className="bar-size" style={{ color: "var(--green)" }}>1.1 MB</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="section-label">{t.features.label}</div>
          <div className="section-heading">{t.features.heading}</div>
          <div className="features">
            {t.features.items.map((f) => (
              <div className="feature" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div id="how">
            <div className="section-label">{t.how.label}</div>
            <div className="section-heading">{t.how.heading}</div>
          </div>
          <div className="steps">
            {t.how.steps.map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">{i + 1}</div>
                <div className="step-body">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className="section-label">{t.presets.label}</div>
          <div className="section-heading">{t.presets.heading}</div>
          <table style={{ marginBottom: 80 }}>
            <thead>
              <tr>{t.presets.cols.map((c) => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {t.presets.rows.map((row, i) => (
                <tr key={i}>
                  <td>
                    {row[0]}
                    {i === 1 && <span className="badge">{t.presets.defaultBadge}</span>}
                  </td>
                  {row.slice(1).map((cell, j) => <td key={j}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Install */}
          <div id="install" className="install">
            <div className="install-heading">{t.install.heading}</div>
            <pre>
              <span className="comment"># clone the repo</span>{"\n"}
              <span className="cmd">git</span> clone https://github.com/Alex92908/lottie-mini.git{"\n"}
              <span className="cmd">cd</span> lottie-mini{"\n\n"}
              <span className="comment"># install dependencies (Python 3.10+)</span>{"\n"}
              <span className="cmd">pip</span> install -r requirements.txt{"\n\n"}
              <span className="comment"># launch the GUI</span>{"\n"}
              <span className="cmd">python</span> compress_lottie_qt.py
            </pre>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              {t.install.note}{" "}
              <a href={`${GITHUB}/blob/main/docs/manual_zh.md`} target="_blank" rel="noopener noreferrer">
                {t.install.manualLink}
              </a>
            </p>
          </div>

          {/* Tools CTA */}
          <div className="preview-cta">
            <div className="section-label">{lang === "en" ? "Browser Tools" : "在线工具"}</div>
            <h2 className="section-heading" style={{ marginBottom: 16 }}>
              {lang === "en" ? "No install? Use the web tools." : "不想装 Python？直接用网页版"}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 28 }}>
              {lang === "en"
                ? "Compress and preview Lottie files entirely in your browser — no upload, no size limit, nothing installed."
                : "压缩和预览全在浏览器里完成——不上传、无大小限制、无需安装任何东西。"}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/compress" className="btn btn-primary" style={{ display: "inline-flex" }}>
                {lang === "en" ? "🗜 Compress online →" : "🗜 在线压缩 →"}
              </Link>
              <Link href="/preview" className="btn btn-ghost" style={{ display: "inline-flex" }}>
                {lang === "en" ? "🎬 Preview & compare →" : "🎬 预览对比 →"}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <p>
            <strong>lottie-mini</strong> · {t.footer.line1}{" "}
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
          <p style={{ marginTop: 8 }}>{t.footer.line2}</p>
        </div>
      </footer>
    </>
  );
}
