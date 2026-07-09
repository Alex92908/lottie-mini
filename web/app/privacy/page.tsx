"use client";
import Link from "next/link";
import { useLang } from "../../lib/LangContext";
import { Footer } from "../../components/Footer";

export default function PrivacyPage() {
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
      <h1>Privacy Policy</h1>
      <p className="lede">
        Last updated: July 2, 2026. lottie-mini is designed to work without collecting any of your
        data. This page describes exactly what information is and isn't handled when you use the
        site.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>Any Lottie file you drop into the site is processed <strong>entirely in your browser</strong>. It is never uploaded to any server, including ours.</li>
        <li>We do not require an account, do not collect email addresses, and do not use cookies to track individual users.</li>
        <li>We use <strong>Vercel Analytics</strong> for aggregate, cookie-free traffic statistics (page views, referrers, browser categories). No personal identifiers are stored.</li>
        <li>We display <strong>Carbon Ads</strong> and <strong>Google AdSense</strong> banners on some pages. Their networks may set their own cookies; both offer opt-out mechanisms.</li>
        <li>The site is open source. If you want to verify any claim on this page, the code is on GitHub.</li>
      </ul>

      <h2>Files you drop into the site</h2>
      <p>
        The compressor, preview tool, and inspector all read files using the browser's File API and
        process them entirely in-memory using JavaScript, WebAssembly, and Web Workers. At no point
        does the file leave your device. You can confirm this by opening the browser's DevTools
        Network panel — you will see no request bodies containing your file, because there are none.
      </p>
      <p>
        Downloads are generated locally as Blob URLs and delivered by your browser's normal
        download flow. The download button click does not trigger a network request.
      </p>

      <h2>What we do collect</h2>
      <h3>Aggregate traffic statistics</h3>
      <p>
        We use <strong>Vercel Analytics</strong>, a privacy-focused analytics service that does not
        use cookies and does not track individual users. Vercel's system stores aggregate data:
        which pages were visited, from which referring site, on which browser category and country.
        No IP addresses are stored beyond the initial edge processing.
      </p>
      <h3>Server logs</h3>
      <p>
        Standard access logs from the Vercel edge infrastructure include IP address, timestamp,
        requested URL, response code, and user agent. These logs are used for security and debugging
        and are automatically deleted per Vercel's retention policy.
      </p>

      <h2>Third-party services</h2>
      <h3>Vercel (hosting and analytics)</h3>
      <p>
        The site is hosted on Vercel. Their privacy policy is at{" "}
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          vercel.com/legal/privacy-policy
        </a>.
      </p>
      <h3>Google AdSense</h3>
      <p>
        We display Google-served ads on some pages (mainly the guide articles). Google may use
        cookies for ad personalization. You can opt out at{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          adssettings.google.com
        </a>{" "}
        or learn more at{" "}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
          policies.google.com/technologies/ads
        </a>.
      </p>
      <h3>Carbon Ads (BuySellAds)</h3>
      <p>
        Carbon Ads serves developer-focused sponsorships on some pages. Their privacy policy is at{" "}
        <a href="https://carbonads.net/privacy" target="_blank" rel="noopener noreferrer">
          carbonads.net/privacy
        </a>.
      </p>

      <h2>Cookies</h2>
      <p>
        The site itself sets one <code>localStorage</code> entry (<code>lang</code>) to remember
        whether you last chose English or Chinese. This is not a cookie and is not transmitted to
        any server. You can clear it any time from your browser's DevTools.
      </p>
      <p>
        Third-party ad networks (Google AdSense, Carbon Ads) may set their own cookies. Please see
        their respective privacy policies above.
      </p>

      <h2>Children's privacy</h2>
      <p>
        lottie-mini is a developer utility and is not directed at children under 13. We do not
        knowingly collect data from children under 13.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we materially change how the site handles data, the "Last updated" date at the top of
        this page will reflect that. The current version of this policy is always what applies.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or requests, email <a href="mailto:alex.chu0206@gmail.com">
        alex.chu0206@gmail.com</a>.
      </p>
    </>
  );
}

function Zh() {
  return (
    <>
      <h1>隐私政策</h1>
      <p className="lede">
        最近更新:2026 年 7 月 2 日。lottie-mini 的设计目标就是不收集你的任何数据。
        这个页面说明使用本站时,哪些数据被处理、哪些不被处理。
      </p>

      <h2>要点</h2>
      <ul>
        <li>你拖入本站的任何 Lottie 文件<strong>完全在浏览器里处理</strong>。永不上传到任何服务器,包括我们自己的。</li>
        <li>不需要注册账号,不收集邮箱地址,不用 cookie 追踪个人用户。</li>
        <li>我们使用 <strong>Vercel Analytics</strong> 做聚合的、无 cookie 的流量统计(页面访问、来源、浏览器分类)。不存储个人标识符。</li>
        <li>部分页面显示 <strong>Carbon Ads</strong> 和 <strong>Google AdSense</strong> 广告。它们的网络可能设置自己的 cookie;两者都提供退出机制。</li>
        <li>本站开源。如果你想验证本页的任何说法,代码在 GitHub 上。</li>
      </ul>

      <h2>你拖入本站的文件</h2>
      <p>
        压缩器、预览工具、分析器都通过浏览器 File API 读取文件,完全用 JavaScript、
        WebAssembly、Web Worker 在内存里处理。任何时刻文件都不会离开你的设备。
        你可以打开浏览器 DevTools 的 Network 面板验证——你不会看到任何包含你文件的请求体,
        因为根本没有。
      </p>
      <p>
        下载文件通过本地生成的 Blob URL,由浏览器的标准下载流程交付。
        点击下载按钮不会触发网络请求。
      </p>

      <h2>我们收集什么</h2>
      <h3>聚合流量统计</h3>
      <p>
        我们使用 <strong>Vercel Analytics</strong>,一个注重隐私的分析服务,
        不使用 cookie 也不追踪个人用户。Vercel 系统存储聚合数据:
        哪些页面被访问、来自哪些引荐站、什么浏览器类别和国家。
        除边缘初始处理外不存 IP 地址。
      </p>
      <h3>服务器日志</h3>
      <p>
        来自 Vercel 边缘基础设施的标准访问日志包括 IP 地址、时间戳、请求 URL、
        响应码、用户代理。这些日志用于安全和调试,按 Vercel 保留策略自动删除。
      </p>

      <h2>第三方服务</h2>
      <h3>Vercel(托管与分析)</h3>
      <p>
        本站托管在 Vercel。他们的隐私政策在{" "}
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          vercel.com/legal/privacy-policy
        </a>。
      </p>
      <h3>Google AdSense</h3>
      <p>
        我们在部分页面(主要是 Guide 文章)显示 Google 提供的广告。
        Google 可能使用 cookie 做广告个性化。你可以在{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          adssettings.google.com
        </a>{" "}
        退出,或在{" "}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
          policies.google.com/technologies/ads
        </a>{" "}
        了解更多。
      </p>
      <h3>Carbon Ads (BuySellAds)</h3>
      <p>
        Carbon Ads 在部分页面提供面向开发者的赞助商展示。
        他们的隐私政策在{" "}
        <a href="https://carbonads.net/privacy" target="_blank" rel="noopener noreferrer">
          carbonads.net/privacy
        </a>。
      </p>

      <h2>Cookie</h2>
      <p>
        本站自己设置一个 <code>localStorage</code> 条目(<code>lang</code>)记住你上次选的是英文还是中文。
        这不是 cookie,也不会传输到任何服务器。你可以随时通过浏览器 DevTools 清除。
      </p>
      <p>
        第三方广告网络(Google AdSense、Carbon Ads)可能设置自己的 cookie。请参见上面各自的隐私政策。
      </p>

      <h2>儿童隐私</h2>
      <p>
        lottie-mini 是开发者工具,面向的不是 13 岁以下儿童。
        我们不会有意收集 13 岁以下儿童的数据。
      </p>

      <h2>本政策的变更</h2>
      <p>
        如果本站在数据处理方式上有实质性变更,本页顶部的"最近更新"日期会反映这一点。
        当前生效的始终是本政策的最新版本。
      </p>

      <h2>联系</h2>
      <p>
        隐私相关问题或请求,请邮件至 <a href="mailto:alex.chu0206@gmail.com">
        alex.chu0206@gmail.com</a>。
      </p>
    </>
  );
}
