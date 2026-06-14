"use client";
import { useLang } from "../../../lib/LangContext";
import ArticleShell from "../ArticleShell";

export default function Article() {
  const { lang } = useLang();
  return <ArticleShell>{lang === "en" ? <En /> : <Zh />}</ArticleShell>;
}

function En() {
  return (
    <>
      <h1>Best practices for shipping Lottie</h1>
      <p className="lede">
        Most Lottie performance problems are introduced at export time, not runtime. Once a designer
        delivers a 70 MB JSON, the only options downstream are compression or replacement. This article
        collects concrete rules of thumb for each role involved — designer, developer, product —
        so the bad export doesn't happen in the first place.
      </p>

      <h2>For designers</h2>

      <h3>Prefer vector layers over rasterized effects</h3>
      <p>
        Any effect that can be expressed with shape layers, vector masks, gradient fills, or AE's built-in
        path operations will export as compact Lottie data. The moment you reach for the Particle Systems
        2 plugin, Trapcode Form, or a video sub-comp, you've crossed into raster territory and Bodymovin
        will rasterize the affected frames as PNG sequences. Sometimes this is unavoidable —
        a beautiful smoke trail isn't going to come out of bezier paths — but it should be a conscious choice,
        not an accidental one.
      </p>

      <h3>Avoid time-remapping on non-vector layers</h3>
      <p>
        Time remapping on a layer that already requires rasterization compounds the frame-sequence problem:
        Bodymovin has to render every frame of the remapped range to PNG. A 2-second clip at 60 fps with
        2× time remapping renders 240 frames where 120 would have sufficed. Bake the time effect
        into the source if you can.
      </p>

      <h3>Keep your composition size honest</h3>
      <p>
        Bodymovin renders embedded image frames at the composition resolution. A 2160 × 2160 comp
        rendering raster frames at 30 fps is producing 4× the byte count of a 1080 × 1080 comp,
        even if the final UI never displays it larger than 200 × 200. Size your composition for the
        target display resolution. If the animation will be rendered at a maximum of 400 pixels wide
        on screen, your comp can be 800 × 800 (2× for retina) — no larger.
      </p>

      <h3>Render a test export before handing off</h3>
      <p>
        Bodymovin's "Render" panel shows you the output file size before saving. If it reads above
        10 MB, that's a sign you should either rework the effect with vector primitives or commit to
        a video export instead. Don't deliver an unviewable file to the engineer and expect them to
        rescue it post hoc.
      </p>

      <h3>Use dotLottie when the effect requires raster</h3>
      <p>
        If you must ship with embedded images, the <code>.lottie</code> format is meaningfully smaller
        than equivalent inline JSON because the PNGs are stored as binary entries rather than base64.
        Recent Bodymovin and LottieFiles tooling both produce <code>.lottie</code> directly.
      </p>

      <h2>For developers</h2>

      <h3>Run every incoming Lottie through the Inspector</h3>
      <p>
        Before integrating a designer's animation, drop the file into the
        <a href="/inspect"> Inspector</a> tool. The byte breakdown tells you in two seconds whether
        you have a problem. If embedded raster is over 20% of the file or total size is over 1 MB,
        push back or compress before integration.
      </p>

      <h3>Lazy-load Lottie players</h3>
      <p>
        The lottie-web player itself is 250–350 KB minified depending on which build you import.
        On bundles where Lottie is used in one optional flow (e.g. an onboarding screen),
        dynamic <code>import("lottie-web")</code> on demand keeps it out of your first-paint payload.
      </p>

      <h3>Use canvas renderer for image-heavy animations</h3>
      <p>
        lottie-web supports SVG, Canvas, and HTML renderers. SVG is the default and handles vector
        animations beautifully, but performs poorly with embedded raster sequences because every frame
        creates and tears down DOM elements. For image-sequence-heavy Lottie, the canvas renderer
        is typically 3–5× more efficient.
      </p>

      <h3>Don't autoplay everywhere</h3>
      <p>
        Lottie animations sustained for hours (typical of loading spinners or background ambience)
        can keep a tab at 5–15% CPU even when not visible. Use <code>IntersectionObserver</code>
        to pause animations that scroll off-screen, and pause on tab visibility change with the
        Page Visibility API.
      </p>

      <h3>Cache aggressively</h3>
      <p>
        Lottie files are content-addressable: once a particular animation is in production, it doesn't
        change. Serve them with a long <code>Cache-Control: public, max-age=31536000, immutable</code>
        header and include a content hash in the filename. Many sites lose 60–80% of their potential
        Lottie load time to a missing immutable cache.
      </p>

      <h2>For product managers and PMs</h2>

      <h3>Set a hard size budget per animation</h3>
      <p>
        Without a budget, animations creep upward over time. A reasonable default ceiling is 200 KB
        for any single animation on the critical render path, and 1 MB for animations on secondary flows.
        Anything larger needs explicit approval and a compression pass.
      </p>

      <h3>Decide Lottie vs video early</h3>
      <p>
        Lottie's strengths are: interactivity (event hooks, color theming, parameter binding), small size
        for vector content, sharpness at any DPI, and easy programmatic control. Its weakness is anything
        photographic or particle-heavy, where video formats win by 5–10× on byte cost.
      </p>
      <p>
        If the animation is fixed (no interactivity required) and has heavy raster content,
        a 5-second MP4 at the right resolution will typically be smaller than even an aggressively
        compressed Lottie equivalent. Don't ship Lottie out of habit when video is the better tool.
      </p>

      <h3>Measure adoption, not just shipping</h3>
      <p>
        Track Lottie load times and player initialization errors in your real user monitoring.
        A heavy Lottie file in a slow-3G scenario can delay the meaningful-paint metric significantly,
        but the issue won't show up in synthetic CI because synthetic networks are fast.
        Real user monitoring is the only signal that tells you whether your animation strategy is working.
      </p>

      <h2>A quick decision flowchart</h2>
      <ol>
        <li>Is the content purely vector (shapes, paths, gradients)? → ship Lottie.</li>
        <li>Is the content mostly vector with one or two small raster accents? → ship Lottie, but compress.</li>
        <li>Is the content image-heavy but interactive (theming, event-driven, parameter-bound)? → ship Lottie, compress aggressively.</li>
        <li>Is the content image-heavy and non-interactive? → ship MP4 or WebM.</li>
        <li>Is the content over 30 seconds? → almost always video.</li>
      </ol>

      <h2>Tools referenced in this article</h2>
      <ul>
        <li><a href="/inspect">Lottie Inspector</a> — file-size breakdown and JSON editor</li>
        <li><a href="/">Lottie Compressor</a> — in-browser WebP re-encoding and frame skipping</li>
        <li><a href="/preview">Lottie Preview</a> — side-by-side comparison playback</li>
      </ul>
    </>
  );
}

function Zh() {
  return (
    <>
      <h1>Lottie 上线最佳实践</h1>
      <p className="lede">
        大多数 Lottie 性能问题在导出环节就埋下了,不是在运行时。
        一旦设计师交付了一个 70 MB JSON,下游只有压缩或替换两个选项。
        这篇文章按角色收集了具体的经验法则——设计师、开发、产品——
        让坏的导出从源头就不要发生。
      </p>

      <h2>设计师篇</h2>

      <h3>优先用矢量图层,避免栅格化效果</h3>
      <p>
        任何能用形状图层、矢量蒙版、渐变填充、AE 内置路径运算实现的效果,
        都会导出为紧凑的 Lottie 数据。一旦你伸手去拿 Particle Systems 2 插件、
        Trapcode Form 或视频子合成,你就跨入栅格领域,Bodymovin 会把受影响的帧
        渲染为 PNG 序列。有时这不可避免——优美的烟雾轨迹不可能出自贝塞尔曲线——
        但应该是有意识的选择,不是意外。
      </p>

      <h3>避免在非矢量图层上做时间重映射</h3>
      <p>
        在已经需要栅格化的图层上做时间重映射会让帧序列问题雪上加霜:
        Bodymovin 必须把重映射范围内的每一帧都渲染成 PNG。一段 2 秒 60 fps 的片段
        做 2× 时间重映射会渲染 240 帧,本来 120 帧就够。如果能,把时间效果烘焙到源素材里。
      </p>

      <h3>诚实设定合成尺寸</h3>
      <p>
        Bodymovin 按合成分辨率渲染内嵌图像帧。一个 2160 × 2160 合成以 30 fps 渲染栅格帧,
        产生的字节数是 1080 × 1080 合成的 4 倍,即使最终 UI 永远不会以大于 200 × 200 显示它。
        按目标显示分辨率设定合成尺寸。如果动画最大渲染到屏幕 400 像素宽,
        你的合成 800 × 800(retina 2 倍)就够——别更大。
      </p>

      <h3>交付前先做一次试导出</h3>
      <p>
        Bodymovin 的"Render"面板会在保存前显示输出文件大小。如果它显示超过 10 MB,
        这是个信号,你要么用矢量原语重做效果,要么干脆改用视频导出。
        别交付一个无法上线的文件给工程师然后期待他们事后救场。
      </p>

      <h3>必须有位图时优先用 dotLottie</h3>
      <p>
        如果必须带内嵌图像上线,<code>.lottie</code> 格式比对应的内联 JSON 显著小,
        因为 PNG 以二进制条目存储而非 base64。近期的 Bodymovin 和 LottieFiles 工具链都能直接产出 <code>.lottie</code>。
      </p>

      <h2>开发者篇</h2>

      <h3>每个交付来的 Lottie 都先过一遍 Inspector</h3>
      <p>
        集成设计师的动画之前,把文件拖进 <a href="/inspect">Inspector</a> 工具。
        字节构成两秒钟就告诉你是否有问题。如果内嵌位图占文件 20% 以上,
        或总体积超过 1 MB,先打回去或者集成前先压缩。
      </p>

      <h3>懒加载 Lottie 播放器</h3>
      <p>
        lottie-web 播放器本身根据导入的构建版本是 250–350 KB minified。
        对只在某一个可选流程(比如 onboarding 屏)用 Lottie 的产品,
        按需 <code>import("lottie-web")</code> 把它从首屏载荷里剔除。
      </p>

      <h3>位图重的动画用 canvas 渲染器</h3>
      <p>
        lottie-web 支持 SVG、Canvas、HTML 三种渲染器。SVG 是默认,处理矢量动画优雅,
        但对内嵌栅格序列表现糟糕,因为每帧都要创建和销毁 DOM 元素。
        对图像序列重的 Lottie,canvas 渲染器通常效率高 3–5 倍。
      </p>

      <h3>不要到处 autoplay</h3>
      <p>
        持续运行数小时的 Lottie 动画(典型的 loading 动画或背景氛围动画)
        即使不可见也能让标签页 CPU 维持在 5–15%。
        用 <code>IntersectionObserver</code> 暂停滚出视窗的动画,
        用 Page Visibility API 在标签页隐藏时暂停。
      </p>

      <h3>狠狠地做缓存</h3>
      <p>
        Lottie 文件是内容可寻址的:一旦某个动画上线了它就不会再变。
        用长缓存头 <code>Cache-Control: public, max-age=31536000, immutable</code> 服务它们,
        文件名带内容哈希。许多站点因为缺少不可变缓存,白白丢掉 60–80% 的 Lottie 加载性能。
      </p>

      <h2>产品/PM 篇</h2>

      <h3>每个动画都设硬性体积预算</h3>
      <p>
        没有预算,动画体积会随时间往上漂。合理的默认上限是:关键渲染路径上的单个动画 200 KB,
        次要流程上的动画 1 MB。再大就需要明确审批和一次压缩。
      </p>

      <h3>提前决定用 Lottie 还是视频</h3>
      <p>
        Lottie 的强项是:可交互(事件钩子、颜色主题化、参数绑定)、矢量内容体积小、
        任意 DPI 都锐利、易于代码控制。它的弱项是任何摄影质感或粒子密集的内容,
        视频格式在字节成本上有 5–10 倍优势。
      </p>
      <p>
        如果动画是固定的(不需要交互)且包含大量位图内容,
        合适分辨率的 5 秒 MP4 通常比激进压缩过的 Lottie 等价物还小。
        别因为习惯就用 Lottie——视频才是合适工具时就用视频。
      </p>

      <h3>测的不只是上线,还有实际采纳</h3>
      <p>
        在真实用户监控里追踪 Lottie 加载时长和播放器初始化错误。
        一个慢 3G 场景下的重 Lottie 文件可能显著延迟有意义渲染指标,
        但这个问题不会在合成 CI 里出现,因为合成网络很快。
        真实用户监控是判断你的动画策略是否奏效的唯一信号。
      </p>

      <h2>一个快速决策流程图</h2>
      <ol>
        <li>内容是纯矢量(形状、路径、渐变)? → 上 Lottie。</li>
        <li>内容主要是矢量,只有一两处小位图点缀? → 上 Lottie,但压缩。</li>
        <li>内容图像重但需要交互(主题化、事件驱动、参数绑定)? → 上 Lottie,激进压缩。</li>
        <li>内容图像重且不需要交互? → 上 MP4 或 WebM。</li>
        <li>内容超过 30 秒? → 几乎总是视频。</li>
      </ol>

      <h2>文中提到的工具</h2>
      <ul>
        <li><a href="/inspect">Lottie Inspector</a> —— 文件体积构成 + JSON 编辑器</li>
        <li><a href="/">Lottie Compressor</a> —— 浏览器内 WebP 重编码 + 抽帧</li>
        <li><a href="/preview">Lottie Preview</a> —— 并排对比播放</li>
      </ul>
    </>
  );
}
