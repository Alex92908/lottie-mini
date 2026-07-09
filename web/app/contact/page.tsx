"use client";
import Link from "next/link";
import { useLang } from "../../lib/LangContext";
import { Footer } from "../../components/Footer";

export default function ContactPage() {
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
            <button className="lang-toggle" onClick={toggle}>{lang === "en" ? "中文" : "EN"}</button>
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
      <h1>Contact</h1>
      <p className="lede">
        lottie-mini is maintained by one person. I read every email and every GitHub issue.
        Response time is usually within 48 hours.
      </p>

      <h2>Email</h2>
      <p>
        The fastest way to reach me is by email:{" "}
        <a href="mailto:alex.chu0206@gmail.com">alex.chu0206@gmail.com</a>.
      </p>
      <p>
        Please email me for:
      </p>
      <ul>
        <li><strong>Bug reports</strong> that involve confidential Lottie files you can't share publicly.</li>
        <li><strong>Partnership or collaboration</strong> inquiries — I'm open to talking about integrations, sponsorships, or feature commissions.</li>
        <li><strong>Press and media</strong> — happy to answer questions for articles about Lottie tooling, browser-based image processing, or WebAssembly in production.</li>
        <li><strong>Privacy or legal</strong> concerns as covered in the{" "}
          <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Use</Link>.</li>
      </ul>

      <h2>GitHub</h2>
      <p>
        For general bug reports, feature requests, and technical questions, GitHub Issues is
        usually a better fit than email — it lets other users benefit from the discussion.
      </p>
      <ul>
        <li>
          <a href="https://github.com/Alex92908/lottie-mini/issues" target="_blank" rel="noopener noreferrer">
            Open an issue
          </a>
        </li>
        <li>
          <a href="https://github.com/Alex92908/lottie-mini/discussions" target="_blank" rel="noopener noreferrer">
            Start a discussion
          </a>
        </li>
        <li>
          <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">
            Star the repository
          </a>{" "}
          if you find the tool useful — it helps other people discover it.
        </li>
      </ul>

      <h2>What to include in a bug report</h2>
      <p>
        If the compressor produced unexpected output for one of your files, please try to include:
      </p>
      <ol>
        <li>The preset you chose (Quality First / Balanced / Smallest / Lossless / Custom, and if Custom, the specific parameter values).</li>
        <li>Approximate input file size and whether it was <code>.json</code> or <code>.lottie</code>.</li>
        <li>The behavior you observed vs what you expected — a screenshot of the preview player often makes this immediately clear.</li>
        <li>The browser and OS you were using.</li>
        <li>If possible, a sample file that reproduces the issue. If it's confidential, describe the Bodymovin export settings or attach a simplified reproduction instead.</li>
      </ol>

      <h2>Response times</h2>
      <p>
        I try to acknowledge emails within 48 hours. Substantive replies (fixes, feature commits)
        depend on the issue and my current workload but usually happen within one to two weeks.
        For urgent production issues, mention "urgent" in the subject and I'll prioritize.
      </p>

      <h2>Author</h2>
      <p>
        Alex Chu (朱枝文), Shanghai. Software engineer.{" "}
        <a href="https://github.com/Alex92908" target="_blank" rel="noopener noreferrer">
          github.com/Alex92908
        </a>.
      </p>
    </>
  );
}

function Zh() {
  return (
    <>
      <h1>联系</h1>
      <p className="lede">
        lottie-mini 由一个人维护。每一封邮件、每一个 GitHub issue 我都会看。
        通常 48 小时内回复。
      </p>

      <h2>邮件</h2>
      <p>
        联系我最快的方式是邮件:{" "}
        <a href="mailto:alex.chu0206@gmail.com">alex.chu0206@gmail.com</a>。
      </p>
      <p>
        以下情况请用邮件:
      </p>
      <ul>
        <li><strong>涉及机密 Lottie 文件</strong>无法公开分享的 bug 报告。</li>
        <li><strong>合作</strong>意向——集成、赞助、功能定制,欢迎聊。</li>
        <li><strong>媒体采访</strong>——关于 Lottie 工具链、浏览器端图像处理、生产环境 WebAssembly 的报道,欢迎问。</li>
        <li><strong>隐私或法律</strong>相关关切,按 <Link href="/privacy">隐私政策</Link> 和 <Link href="/terms">使用条款</Link> 覆盖范围。</li>
      </ul>

      <h2>GitHub</h2>
      <p>
        通用 bug 报告、功能请求、技术问题,GitHub Issues 通常比邮件合适——
        其他用户也能从讨论中受益。
      </p>
      <ul>
        <li>
          <a href="https://github.com/Alex92908/lottie-mini/issues" target="_blank" rel="noopener noreferrer">
            提 Issue
          </a>
        </li>
        <li>
          <a href="https://github.com/Alex92908/lottie-mini/discussions" target="_blank" rel="noopener noreferrer">
            开个 Discussion
          </a>
        </li>
        <li>
          <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">
            给仓库点 Star
          </a>——如果你觉得工具好用,这能帮别人发现它。
        </li>
      </ul>

      <h2>bug 报告需要包含什么</h2>
      <p>
        如果压缩器对你的文件产生了意外输出,请尽量包含:
      </p>
      <ol>
        <li>你选的预设(质量优先 / 均衡 / 极小 / 无损 / 自定义,自定义的话具体参数值)。</li>
        <li>输入文件大约多大,是 <code>.json</code> 还是 <code>.lottie</code>。</li>
        <li>观察到的行为 vs 预期的行为——一张预览播放器的截图往往能让问题立刻清楚。</li>
        <li>你使用的浏览器和系统。</li>
        <li>如果可能,附一个能复现问题的样本文件。如果文件机密,描述 Bodymovin 导出设置,或附一个简化复现版本代替。</li>
      </ol>

      <h2>响应时间</h2>
      <p>
        我会尽量在 48 小时内确认邮件。实质性回复(修复、功能提交)取决于问题和我当前工作量,
        通常在一到两周内完成。生产环境紧急问题请在标题写"urgent",我会优先处理。
      </p>

      <h2>作者</h2>
      <p>
        Alex Chu(朱枝文),上海,软件工程师。{" "}
        <a href="https://github.com/Alex92908" target="_blank" rel="noopener noreferrer">
          github.com/Alex92908
        </a>。
      </p>
    </>
  );
}
