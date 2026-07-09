"use client";
import Link from "next/link";
import { useLang } from "../../lib/LangContext";
import { Footer } from "../../components/Footer";

export default function AboutPage() {
  const { lang, toggle } = useLang();
  const back = lang === "en" ? "← Back" : "← 返回";

  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link href="/" style={{ display: "block" }}>
            <img src="/logo-text.svg" alt="lottie-mini" height={36} style={{ display: "block" }} />
          </Link>
          <div className="nav-links">
            <Link href="/">{back}</Link>
            <button className="lang-toggle" onClick={toggle}>
              {lang === "en" ? "中文" : "EN"}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
          <article className="page-prose">
            {lang === "en" ? <En /> : <Zh />}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

function En() {
  return (
    <>
      <h1>About lottie-mini</h1>
      <p className="lede">
        lottie-mini is an open-source toolkit for compressing, previewing, and analyzing Lottie
        animation files entirely inside the browser. This page explains why it exists, who's behind
        it, and where it's going.
      </p>

      <h2>The origin story</h2>
      <p>
        In early 2026 I was working on a mobile web project when a designer handed me a Lottie
        animation and said it was "small." The file was 71 megabytes — a JSON document with hundreds
        of PNG frames base64-encoded inside it. Every existing Lottie optimizer I tried either
        refused files over 20 MB, only touched vector data (leaving the embedded PNGs untouched),
        or required uploading the file to a server I didn't trust with pre-release brand assets.
      </p>
      <p>
        I spent the next weekend building the compression pipeline that eventually became
        lottie-mini. The core insight was straightforward: the bytes are in the embedded PNGs, and
        re-encoding them to WebP with optional frame skipping fixes 95% of "huge Lottie" cases in
        one pass. Getting it to work reliably across every browser, dotLottie format variants, and
        weird Bodymovin exports took the rest of the year.
      </p>

      <h2>Who's behind it</h2>
      <p>
        My name is Alex Chu (朱枝文). I'm a software engineer based in Shanghai, working primarily
        on frontend and web tooling. I write open-source projects when I encounter problems that I
        can't solve with existing tools — lottie-mini started as one of those. You can find my
        other projects at <a href="https://github.com/Alex92908" target="_blank" rel="noopener noreferrer">
        github.com/Alex92908</a>. I'm reachable at{" "}
        <a href="mailto:alex.chu0206@gmail.com">alex.chu0206@gmail.com</a>.
      </p>

      <h2>Project philosophy</h2>
      <p>
        Three things guide every decision on this project:
      </p>
      <ul>
        <li><strong>Local-first.</strong> Nothing is uploaded to any server. Every operation runs
          in your browser using WebAssembly and Web Workers. This isn't a performance choice —
          it's a trust choice. People who work with unreleased brand assets shouldn't have to
          upload them to a third party just to shrink a file.</li>
        <li><strong>No artificial limits.</strong> No file size cap. No account required. No paid
          tier. No rate limiting. If the browser can handle the file, the tools handle it.</li>
        <li><strong>Explain, don't just do.</strong> The Inspector shows you exactly what's in your
          file. The Guide articles document the pipeline. The source code is on GitHub. If a
          user disagrees with a compression decision, they should be able to see why it was made.</li>
      </ul>

      <h2>What's on the site</h2>
      <ul>
        <li><Link href="/">Compressor</Link> — the main tool. Drop a .json or .lottie file,
          choose a preset, download the compressed result.</li>
        <li><Link href="/preview">Preview</Link> — side-by-side Lottie playback for comparing
          versions or verifying that compression didn't break the animation.</li>
        <li><Link href="/inspect">Inspector</Link> — full JSON analyzer and editor. Shows file-size
          breakdown, ranks the largest embedded assets, and lets you edit any field with
          undo/redo.</li>
        <li><Link href="/guide">Guide</Link> — three long-form articles on why Lottie files get
          large, best practices for shipping them, and how the compression pipeline works.</li>
      </ul>

      <h2>Roadmap</h2>
      <p>
        Near-term I'm working on: a standalone npm CLI so people can run the pipeline in CI,
        AVIF support alongside WebP for browsers that decode it (currently only some of the newer
        Lottie players do), and a REST API for people who want to script batch conversion at scale.
      </p>
      <p>
        If there's something you'd like the tool to do that it doesn't, please email me or open an
        issue on GitHub. Small independent tools live and die by whether their users tell them
        what to build next.
      </p>

      <h2>Support</h2>
      <p>
        lottie-mini is free and always will be. If it saved you meaningful engineering time and you
        want to say thanks, the most valuable thing you can do is star the{" "}
        <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">
          GitHub repository
        </a>{" "}
        or share the site with a colleague who might need it. Written testimonials and case
        studies are also welcome — email me and we can talk about featuring your use case in the
        guide.
      </p>
    </>
  );
}

function Zh() {
  return (
    <>
      <h1>关于 lottie-mini</h1>
      <p className="lede">
        lottie-mini 是一套开源的 Lottie 动画文件工具集,压缩、预览、分析全部在浏览器里完成。
        这个页面讲清楚它为什么存在、背后是谁、往哪儿走。
      </p>

      <h2>起源</h2>
      <p>
        2026 年初我在做一个移动端 Web 项目,一位设计师交给我一个 Lottie 动画文件,
        说"很小"。文件是 71 MB —— 一个内嵌了数百帧 base64 编码 PNG 的 JSON 文档。
        我试过的所有 Lottie 优化工具要么拒绝超过 20 MB 的文件,要么只处理矢量数据
        (完全不动内嵌 PNG),要么要求把文件上传到我不敢信任的服务器
        (那批素材是未发布的品牌资产)。
      </p>
      <p>
        我用接下来那个周末搭出了压缩流水线的雏形,后来演化成 lottie-mini。
        核心洞察很简单:字节在内嵌 PNG 里,重编码为 WebP 加可选抽帧,
        一次操作能解决 95% 的"Lottie 巨大"场景。让它在每个浏览器、
        每种 dotLottie 变体、每种奇怪的 Bodymovin 导出上都稳定工作,花了剩下的一年。
      </p>

      <h2>关于我</h2>
      <p>
        我叫 Alex Chu(朱枝文),常驻上海,是一名软件工程师,主要做前端和 Web 工具方向。
        遇到用现成工具解决不了的问题时,我会写开源项目——lottie-mini 就是其中之一。
        你可以在 <a href="https://github.com/Alex92908" target="_blank" rel="noopener noreferrer">
        github.com/Alex92908</a> 找到我其他项目。联系邮箱:{" "}
        <a href="mailto:alex.chu0206@gmail.com">alex.chu0206@gmail.com</a>。
      </p>

      <h2>项目理念</h2>
      <p>
        三件事指导这个项目的每一个决定:
      </p>
      <ul>
        <li><strong>本地优先。</strong>任何东西都不上传到任何服务器。
          每一个操作都在你的浏览器里用 WebAssembly 和 Web Worker 完成。
          这不是性能选择,是信任选择。
          用未发布品牌资产的人不应该为了压小文件就把资产传给第三方。</li>
        <li><strong>没有人为限制。</strong>没有文件大小上限。不用注册账号。没有付费档。
          没有限流。浏览器能处理的文件,工具就能处理。</li>
        <li><strong>解释,不只是执行。</strong>Inspector 告诉你文件里到底是什么。
          Guide 文章记录整条流水线。源代码在 GitHub 上。
          如果用户不同意某个压缩决定,他应该能看到为什么这么决定。</li>
      </ul>

      <h2>站内有什么</h2>
      <ul>
        <li><Link href="/">压缩工具</Link>——主工具。拖入 .json 或 .lottie 文件,
          选一个预设,下载压缩结果。</li>
        <li><Link href="/preview">预览</Link>——Lottie 并排播放,用来对比版本
          或验证压缩没破坏动画。</li>
        <li><Link href="/inspect">分析</Link>——完整的 JSON 分析器和编辑器。
          显示体积构成、排序最大的内嵌资源、支持带撤销/重做的字段编辑。</li>
        <li><Link href="/guide">使用指南</Link>——三篇深度长文,
          讲 Lottie 文件为什么会大、上线最佳实践、压缩流水线原理。</li>
      </ul>

      <h2>路线图</h2>
      <p>
        近期在做的:独立 npm CLI 让人能在 CI 里跑流水线;
        WebP 之外加 AVIF 支持(目前只有部分较新的 Lottie 播放器解码);
        以及给想批量脚本化的人用的 REST API。
      </p>
      <p>
        如果你希望工具做而它现在不能做的事,请给我发邮件或提 GitHub issue。
        独立小工具的生死取决于用户告诉它下一步该做什么。
      </p>

      <h2>支持</h2>
      <p>
        lottie-mini 是免费的,永远会是。
        如果它节省了你可观的工程时间,想表示感谢,最有价值的事是给{" "}
        <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">
          GitHub 仓库点个 Star
        </a>{" "}
        或者把站点分享给可能需要它的同事。也欢迎书面 testimonial 和 case study
        ——给我发邮件,我们可以聊聊在 Guide 里介绍你的使用场景。
      </p>
    </>
  );
}
