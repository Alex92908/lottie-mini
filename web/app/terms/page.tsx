"use client";
import Link from "next/link";
import { useLang } from "../../lib/LangContext";
import { Footer } from "../../components/Footer";

export default function TermsPage() {
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
      <h1>Terms of Use</h1>
      <p className="lede">
        Last updated: July 2, 2026. lottie-mini is free to use for personal and commercial
        purposes. These are the terms that govern your use of the site and the underlying
        open-source software.
      </p>

      <h2>1. Acceptance</h2>
      <p>
        By using lottie-mini.com or the associated source code, you agree to these terms.
        If you do not agree, please stop using the site.
      </p>

      <h2>2. License to use the site</h2>
      <p>
        lottie-mini is free to use for any purpose, personal or commercial. You do not need to
        register, obtain a license key, or credit the project (though credit is appreciated). You
        may run the compressor, preview tool, and inspector on any Lottie file, including files
        owned by third parties, provided you have the right to modify those files under any
        contract or license that governs them.
      </p>

      <h2>3. License to the underlying source code</h2>
      <p>
        The source code is released under the <strong>MIT License</strong>. You may copy, modify,
        distribute, and use the code in your own projects, commercial or otherwise, subject to the
        terms of that license. The full license text is included in the GitHub repository at{" "}
        <a href="https://github.com/Alex92908/lottie-mini/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
          github.com/Alex92908/lottie-mini/blob/main/LICENSE
        </a>.
      </p>

      <h2>4. No warranty</h2>
      <p>
        The tools are provided "as is," without warranty of any kind, express or implied,
        including but not limited to warranties of merchantability, fitness for a particular
        purpose, and non-infringement. We test the compression pipeline extensively, but we make
        no guarantee that it will produce visually identical output for every Lottie file, or that
        the compressed file will play correctly in every Lottie player.
      </p>
      <p>
        Before shipping a compressed animation to production, we strongly recommend previewing
        it using our <Link href="/preview">side-by-side preview tool</Link> and testing playback in
        your target player.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, the authors and contributors of lottie-mini are
        not liable for any damages arising from your use of the site or the software, including
        but not limited to lost data, corrupted files, or lost revenue. Your only remedy is to
        stop using the tools.
      </p>

      <h2>6. Content ownership</h2>
      <p>
        Any Lottie file you drop into the site remains entirely yours. We do not receive, store,
        or claim any rights to your content. See our <Link href="/privacy">Privacy Policy</Link>{" "}
        for details on how files are handled.
      </p>

      <h2>7. Prohibited uses</h2>
      <p>
        You may not use the site to:
      </p>
      <ul>
        <li>Attempt to overload, damage, or gain unauthorized access to the site's infrastructure.</li>
        <li>Process content whose modification would violate copyright or other applicable law.</li>
        <li>Redistribute the site itself (as opposed to the open-source code) as a commercial service without permission.</li>
      </ul>

      <h2>8. Advertising</h2>
      <p>
        Some pages of the site display advertisements from Google AdSense and Carbon Ads.
        Sponsored content is clearly labeled. We do not endorse any product or service advertised
        via these networks.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        We may update these terms occasionally. The "Last updated" date at the top of this page
        will reflect any changes. Continued use of the site after a change constitutes acceptance
        of the new terms.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of the People's Republic of China. Any disputes
        arising from these terms will be resolved in the courts of Shanghai.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:alex.chu0206@gmail.com">
        alex.chu0206@gmail.com</a>.
      </p>
    </>
  );
}

function Zh() {
  return (
    <>
      <h1>使用条款</h1>
      <p className="lede">
        最近更新:2026 年 7 月 2 日。lottie-mini 免费供个人和商业使用。
        以下条款约束你对本站和底层开源软件的使用。
      </p>

      <h2>1. 接受条款</h2>
      <p>
        使用 lottie-mini.com 或相关源代码即视为你同意这些条款。
        如果你不同意,请停止使用本站。
      </p>

      <h2>2. 网站使用许可</h2>
      <p>
        lottie-mini 免费供任何目的使用,个人或商业均可。
        你不需要注册、获取许可证密钥、或标注项目(但欢迎标注)。
        你可以在任何 Lottie 文件上运行压缩器、预览工具、分析器,
        包括第三方拥有的文件,前提是你有权按管辖它们的任何合同或许可证修改这些文件。
      </p>

      <h2>3. 底层源代码许可</h2>
      <p>
        源代码基于 <strong>MIT License</strong> 发布。
        你可以在自己的项目中复制、修改、分发、使用代码,商业与否,前提是遵守该许可证条款。
        完整许可证文本在 GitHub 仓库{" "}
        <a href="https://github.com/Alex92908/lottie-mini/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
          github.com/Alex92908/lottie-mini/blob/main/LICENSE
        </a>。
      </p>

      <h2>4. 免责声明</h2>
      <p>
        工具"按现状"提供,不含任何形式的明示或暗示保证,包括但不限于对适销性、
        特定用途适用性、非侵权的保证。我们广泛测试了压缩流水线,
        但不保证它会对每个 Lottie 文件产生视觉上相同的输出,
        也不保证压缩后的文件能在每个 Lottie 播放器中正确播放。
      </p>
      <p>
        将压缩后的动画交付到生产环境前,我们强烈建议用我们的
        <Link href="/preview">并排预览工具</Link>预览,并在你的目标播放器中测试播放。
      </p>

      <h2>5. 责任限制</h2>
      <p>
        在法律允许的最大范围内,lottie-mini 的作者和贡献者不对你使用本站或软件所致的任何损害负责,
        包括但不限于数据丢失、文件损坏、收入损失。你唯一的救济是停止使用工具。
      </p>

      <h2>6. 内容所有权</h2>
      <p>
        你拖入本站的任何 Lottie 文件完全归你所有。
        我们不接收、存储、或主张对你内容的任何权利。
        文件处理细节参见 <Link href="/privacy">隐私政策</Link>。
      </p>

      <h2>7. 禁止用途</h2>
      <p>
        你不得使用本站:
      </p>
      <ul>
        <li>尝试过载、损害本站基础设施,或非法获取访问权限。</li>
        <li>处理其修改会违反版权或其他适用法律的内容。</li>
        <li>未经许可,以商业服务形式重新分发本站本身(与开源代码不同)。</li>
      </ul>

      <h2>8. 广告</h2>
      <p>
        本站部分页面展示 Google AdSense 和 Carbon Ads 的广告。
        赞助内容都会明确标注。我们不背书通过这些网络投放的任何产品或服务。
      </p>

      <h2>9. 条款变更</h2>
      <p>
        我们可能不定期更新这些条款。本页顶部的"最近更新"日期会反映任何变更。
        变更后继续使用本站即视为接受新条款。
      </p>

      <h2>10. 管辖法律</h2>
      <p>
        这些条款受中华人民共和国法律管辖。因这些条款产生的任何争议将在上海市法院解决。
      </p>

      <h2>联系</h2>
      <p>
        关于这些条款的问题:<a href="mailto:alex.chu0206@gmail.com">
        alex.chu0206@gmail.com</a>。
      </p>
    </>
  );
}
