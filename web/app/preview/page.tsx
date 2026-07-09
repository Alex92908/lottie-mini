"use client";
import Link from "next/link";
import { useLang } from "../../lib/LangContext";
import { CarbonAd } from "../../components/CarbonAd";
import { Footer } from "../../components/Footer";
import LottiePreview from "./LottiePlayer";

export default function PreviewPage() {
  const { lang, toggle } = useLang();

  const t = {
    en: {
      back: "← Back",
      inspect: "Inspect",
      guide: "Guide",
      title: "Lottie Preview",
      sub: "Drop your before & after files side-by-side. Runs 100% in your browser — nothing is uploaded.",
      tip: "Tip: use the Balanced preset in lottie-mini, then compare the two files here.",

      explainH: "Why a separate preview tool?",
      explainP1:
        "Most online Lottie viewers cap uploads at 5–10 MB and require an account. That works for vector-only animations a few KB in size, but the moment your file embeds PNG sequences from After Effects, you're in the 20–100 MB range — and those previewers give up before they begin.",
      explainP2:
        "The Lottie Preview tool above runs entirely in your browser. There is no server, no upload, no size limit. You can drop two files side-by-side to compare versions — for example, an original Lottie against a compressed one, or two iterations of an animation from your designer. Both players are synchronized so you can spot visual regressions the moment they appear.",

      useH: "Common workflows",
      use1H: "1. Compression QA",
      use1B:
        "After running a Lottie through the compressor, preview both files together to confirm the reduced version still plays correctly. Especially important when using aggressive presets like Smallest (q70 + frame skipping) on animations with subtle gradients or fine detail.",
      use2H: "2. Designer-to-developer handoff",
      use2B:
        "Designers can drop a candidate .json or .lottie file here before sending it to engineering, verifying playback in a neutral environment that matches what end users will see on the web.",
      use3H: "3. A/B comparing animation revisions",
      use3B:
        "When iterating an animation, the side-by-side player makes timing and easing differences immediately obvious — far more useful than playing each version separately in a player widget.",

      privacyH: "Privacy",
      privacyP:
        "The preview runs entirely in your browser using lottie-web. Your file is never transmitted to any server, including ours. You can use this on confidential pre-release assets without concern.",
    },
    zh: {
      back: "← 返回",
      inspect: "文件分析",
      guide: "使用指南",
      title: "Lottie 在线预览",
      sub: "把压缩前后的文件并排拖入,直观对比效果。完全在浏览器本地运行,不上传任何数据。",
      tip: "提示:用 lottie-mini 的「均衡」预设压缩,然后把两个文件拖入左右对比。",

      explainH: "为什么需要一个独立的预览工具?",
      explainP1:
        "市面上大多数在线 Lottie 预览器都有 5–10 MB 的上传限制,而且需要登录账号。对几 KB 的纯矢量动画这没问题,但只要你的文件里内嵌了 After Effects 导出的 PNG 帧序列,体积通常就在 20–100 MB 之间——这些预览器还没开始就放弃了。",
      explainP2:
        "上面这个 Lottie Preview 工具完全在你的浏览器里运行。没有服务器、没有上传、没有大小限制。你可以同时拖入两个文件做并排对比——比如把原始 Lottie 和压缩后的版本放一起看,或者比较设计师的两个动画版本。两个播放器是同步的,任何视觉差异都会立刻被你看到。",

      useH: "常见使用场景",
      use1H: "1. 压缩质量验收",
      use1B:
        "压缩完一个 Lottie 文件后,把压缩前后两个版本同时拖进来,确认缩小后的文件还能正确播放。这一步在使用「极小」这类激进预设(q70 + 抽帧)时尤其重要,因为细腻渐变或精细细节可能在重编码中失真。",
      use2H: "2. 设计师到开发的交付确认",
      use2B:
        "设计师交付前可以在这里拖入 `.json` 或 `.lottie` 文件,在一个中立的环境中验证播放效果,这个环境和最终用户在网页上看到的完全一致。",
      use3H: "3. A/B 对比动画迭代",
      use3B:
        "动画反复调整时,并排播放可以让节奏和缓动的差异一目了然——比一个一个播放再脑补对比要有用得多。",

      privacyH: "隐私",
      privacyP:
        "预览功能使用 lottie-web 完全在浏览器中运行。你的文件不会发送到任何服务器,也包括我们自己的。可以放心用在未发布的机密素材上。",
    },
  }[lang];

  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link href="/" style={{ display: "block" }}>
            <img src="/logo-text.svg" alt="lottie-mini" height={36} style={{ display: "block" }} />
          </Link>
          <div className="nav-links">
            <Link href="/inspect">{t.inspect}</Link>
            <Link href="/guide">{t.guide}</Link>
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

          <article className="page-prose">
            <h2>{t.explainH}</h2>
            <p>{t.explainP1}</p>
            <p>{t.explainP2}</p>

            <h2>{t.useH}</h2>
            <h3>{t.use1H}</h3>
            <p>{t.use1B}</p>
            <h3>{t.use2H}</h3>
            <p>{t.use2B}</p>
            <h3>{t.use3H}</h3>
            <p>{t.use3B}</p>

            <h2>{t.privacyH}</h2>
            <p>{t.privacyP}</p>
          </article>

          <div className="ad-row">
            <CarbonAd />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
