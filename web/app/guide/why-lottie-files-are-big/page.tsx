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
      <h1>Why your Lottie file is 70 MB</h1>
      <p className="lede">
        Lottie is a JSON format. You'd expect a JSON file describing an animation to be a few kilobytes at most.
        And for pure vector animations, it is. But the moment your designer's After Effects composition
        includes raster effects, the file can balloon to tens of megabytes. This article explains
        the structural reason, with concrete measurements, and what actually compresses it.
      </p>

      <h2>The structure of a Lottie file</h2>
      <p>
        A Lottie JSON has three top-level sections that matter for size: the animation header
        (canvas dimensions <code>w</code>, <code>h</code>, frame rate <code>fr</code>,
        in/out points <code>ip</code>/<code>op</code>), the <code>layers</code> array describing
        what to draw on each frame, and the <code>assets</code> array containing referenced sub-compositions
        and embedded image resources.
      </p>
      <p>
        For a pure vector animation — say, a checkmark, a loading spinner, or a logo morph —
        the entire file is shape data: anchor points, bezier handles, color stops, and transform matrices.
        These are remarkably compact. A complex hand-drawn logo morph is typically under 30 KB.
      </p>
      <p>
        The pivot point comes when a designer needs to express something vectors can't easily describe:
        soft glows, particle systems, fluid dynamics, photographic textures, or anything involving real
        image processing. In After Effects, these are routinely done with bitmap layers,
        sub-comps containing video, or precomposed effect stacks. None of them are
        representable as native Lottie shapes.
      </p>

      <h2>Enter Bodymovin and the PNG sequence escape hatch</h2>
      <p>
        Bodymovin, the After Effects plugin that exports Lottie JSON, has a clever fallback for the
        non-vector case: it renders the un-translatable layers to a sequence of PNG frames and inlines
        each frame into the JSON as a base64-encoded data URL. The result is a single self-contained
        animation file at the cost of dramatic size inflation.
      </p>
      <p>
        Here's a typical <code>assets</code> entry:
      </p>
      <pre><code>{`{
  "id": "image_0",
  "p": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "e": 1,
  "u": ""
}`}</code></pre>
      <p>
        The <code>p</code> field carries the entire PNG, encoded as base64. Base64 itself adds about
        33% overhead on top of the binary payload, so a 200 KB PNG becomes a ~270 KB string in the JSON.
        Multiply that by 150 frames in a 5-second animation at 30 fps, and you have a 40 MB JSON document
        — before any of the actual animation logic is even counted.
      </p>

      <h2>Real-world measurements</h2>
      <p>
        We've inspected several hundred reader-submitted Lottie files and the breakdown is remarkably consistent:
      </p>
      <ul>
        <li><strong>Vector-only files:</strong> 5 KB – 200 KB. Often shippable without further processing.</li>
        <li><strong>Mixed-content files with light raster effects:</strong> 1 MB – 8 MB. Still problematic on mobile.</li>
        <li><strong>Image-sequence-heavy files:</strong> 20 MB – 100 MB. Cannot ship without intervention.</li>
      </ul>
      <p>
        The Inspector tool on this site classifies a file in two clicks: it walks the assets array,
        identifies entries whose <code>p</code> field is a data URL, and reports both the byte share
        and the per-asset breakdown. A 70 MB file might have 99% of its bytes locked up in fewer than
        a dozen <code>image_*</code> assets.
      </p>

      <h2>What doesn't compress well</h2>
      <p>
        It's worth understanding why ordinary tools fail on this problem.
      </p>
      <p>
        <strong>Vector-only Lottie optimizers</strong> (the kind LottieFiles publishes, or the optimization
        flags in lottie-web's build pipeline) walk the shape tree and prune redundant keyframes, round
        floating-point coordinates, and dedupe identical layers. They are excellent for purely vector
        animations but never touch the <code>assets</code> array. A 70 MB file with embedded PNGs is
        still 70 MB after running through these tools.
      </p>
      <p>
        <strong>Generic JSON minifiers</strong> remove whitespace, which is essentially free here:
        Bodymovin output is already minified. A few additional percent off the structural fields makes
        no measurable difference when 99% of the file is base64 image data.
      </p>
      <p>
        <strong>Gzip and Brotli</strong> at the HTTP layer reduce the JSON by some amount, but base64-encoded
        PNG is essentially incompressible: PNG already does its own entropy coding internally, and
        wrapping it in base64 randomizes the byte distribution. Real-world Brotli on these files
        achieves 5–15% reduction at most, far short of what's needed.
      </p>

      <h2>What does compress: re-encoding to WebP</h2>
      <p>
        The leverage point is the embedded raster. Modern image formats reach quality parity with PNG
        at a fraction of the byte cost. WebP, in particular, at quality 75 typically produces files about
        80% smaller than the equivalent PNG, with no perceptible visual difference for animation frames.
      </p>
      <p>
        The lottie-mini compressor decodes each embedded PNG in your browser, re-encodes it as
        WebP via a WebAssembly build of libwebp, and rewrites the data URL in place. The output
        is still a single self-contained Lottie file that any modern player can consume.
      </p>

      <h2>And the second lever: frame skipping</h2>
      <p>
        Most animations that ship at 60 fps are imperceptible from 30 fps when re-encoded properly.
        Many ship comfortably at 24 fps or even 15 fps for slow-changing scenes. Dropping every other
        frame and adjusting the <code>ip</code>/<code>op</code> values to match cuts the asset payload
        by 50% with no perceived quality loss.
      </p>
      <p>
        This is the second knob the compressor exposes. Combined with WebP re-encoding, a 70 MB
        Lottie often lands well under 1 MB — small enough to embed in a small-payload context like a
        WeChat Mini Program (2 MB total budget) or a mobile first-frame HTML payload.
      </p>

      <h2>The dotLottie wrinkle</h2>
      <p>
        The newer <code>.lottie</code> file format is a zip container holding the JSON plus images as
        separate files. This avoids base64 overhead by storing each PNG as a binary entry. dotLottie
        is meaningfully smaller than equivalent inlined JSON, but the embedded PNGs themselves are
        still PNGs — there's no automatic re-encoding to a better format.
      </p>
      <p>
        The Inspector and Compressor both treat <code>.lottie</code> files as first-class input:
        they unzip in your browser using fflate, operate on the inner animation JSON, and re-zip
        the result, preserving the manifest and any sibling files.
      </p>

      <h2>When to stop optimizing and use video instead</h2>
      <p>
        There's a threshold beyond which Lottie stops being the right tool. If your animation is essentially
        a video — every frame is a fully different rendered scene with no shared geometry — then a
        short MP4 or WebM with the same frame rate will be smaller than any Lottie equivalent, and players
        like HTML5 video are battle-hardened. Lottie's advantages (interactivity, dynamic colors,
        sharp on any DPI, easy programmatic control) all evaporate when the content is just pixels.
      </p>
      <p>
        A useful rule of thumb: if your compressed Lottie is still larger than 2 MB and is over 2 seconds long,
        check whether an H.264 MP4 of the same animation would be smaller. If yes, ship the MP4.
      </p>

      <h2>Summary</h2>
      <p>
        Lottie files explode in size because Bodymovin inlines untranslatable layers as base64-encoded
        PNG sequences. Traditional optimization can't touch this — the leverage is in re-encoding
        those raster frames to WebP and lowering the effective frame rate. Combined, these two operations
        typically reduce file size by 50–100×. The Inspector tool on this site quantifies
        the problem in one drop, and the Compressor solves it without uploading anything.
      </p>
    </>
  );
}

function Zh() {
  return (
    <>
      <h1>为什么你的 Lottie 文件有 70 MB</h1>
      <p className="lede">
        Lottie 是 JSON 格式。你会预期一个描述动画的 JSON 文件最多几 KB。
        对纯矢量动画来说,确实如此。但只要设计师的 After Effects 工程中包含了位图效果,
        文件就可能膨胀到几十 MB。这篇文章用具体数据解释了根本原因,以及真正能压缩它的方法。
      </p>

      <h2>Lottie 文件的结构</h2>
      <p>
        一个 Lottie JSON 在体积上有意义的三个顶层段落:动画头信息(画布 <code>w</code>、<code>h</code>、
        帧率 <code>fr</code>、起止帧 <code>ip</code>/<code>op</code>),描述每帧绘制内容的 <code>layers</code> 数组,
        以及容纳引用子合成和内嵌图像资源的 <code>assets</code> 数组。
      </p>
      <p>
        对纯矢量动画——比如一个对勾、加载转圈、Logo 形变——整个文件就是形状数据:
        锚点、贝塞尔控制柄、颜色色标、变换矩阵。这些极其紧凑。
        一个复杂的手绘 Logo 形变通常不到 30 KB。
      </p>
      <p>
        转折点出现在设计师要表达矢量无法描述的效果:柔和发光、粒子系统、流体动力学、摄影质感纹理,
        或任何涉及真实图像处理的内容。在 AE 里,这些通常用位图层、嵌入视频的子合成、
        或预合成的特效堆栈实现。它们都无法表示为原生 Lottie 形状。
      </p>

      <h2>Bodymovin 与 PNG 序列这个"逃生口"</h2>
      <p>
        Bodymovin,这个把 AE 工程导出为 Lottie JSON 的插件,对非矢量场景有一个巧妙的兜底:
        把无法翻译的图层渲染成一系列 PNG 帧,把每帧用 base64 编码成 data URL 内嵌进 JSON。
        结果是一个自包含的单一动画文件,代价是体积剧烈膨胀。
      </p>
      <p>
        典型的 <code>assets</code> 条目长这样:
      </p>
      <pre><code>{`{
  "id": "image_0",
  "p": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "e": 1,
  "u": ""
}`}</code></pre>
      <p>
        <code>p</code> 字段承载整张 PNG,base64 编码。Base64 本身在二进制载荷上额外增加约 33% 开销,
        所以 200 KB 的 PNG 变成 JSON 里约 270 KB 的字符串。
        乘以 5 秒 30 fps 动画的 150 帧,你得到一个 40 MB 的 JSON 文档——
        还没把动画逻辑本身的字节算进去。
      </p>

      <h2>真实世界的测量</h2>
      <p>
        我们检视了数百个读者提交的 Lottie 文件,数据分布非常一致:
      </p>
      <ul>
        <li><strong>纯矢量文件:</strong>5 KB – 200 KB。通常无需处理可直接上线。</li>
        <li><strong>含轻度位图效果的混合文件:</strong>1 MB – 8 MB。移动端依然问题明显。</li>
        <li><strong>大量图像序列的重文件:</strong>20 MB – 100 MB。不处理无法上线。</li>
      </ul>
      <p>
        本站的 Inspector 工具两次点击就能给文件分类:它遍历 assets 数组,
        识别 <code>p</code> 字段是 data URL 的条目,报告字节占比和每个资源的细分。
        一个 70 MB 文件可能 99% 的字节锁在不到一打的 <code>image_*</code> 资源里。
      </p>

      <h2>为什么常规工具压不动</h2>
      <p>
        理解为什么普通工具在这个问题上失败,值得花两分钟。
      </p>
      <p>
        <strong>矢量 Lottie 优化器</strong>(LottieFiles 提供的那种,或者 lottie-web
        构建管线里的优化开关)遍历形状树,剪枝多余关键帧、对浮点坐标做舍入、
        合并相同图层。它们对纯矢量动画极其有效,但完全不碰 <code>assets</code> 数组。
        一个含内嵌 PNG 的 70 MB 文件,经过这些工具后仍然是 70 MB。
      </p>
      <p>
        <strong>通用 JSON 压缩</strong>去掉空白字符,基本上是免费的:
        Bodymovin 的输出已经是 minified 的。对结构字段再省一点根本不会被察觉,
        因为 99% 的文件是 base64 图像数据。
      </p>
      <p>
        <strong>HTTP 层的 Gzip 和 Brotli</strong> 能压缩 JSON 一些,但 base64 编码的 PNG 本质上不可压缩:
        PNG 内部已经做了自己的熵编码,再裹一层 base64 把字节分布随机化了。
        实际测试 Brotli 在这种文件上最多降 5–15%,远远不够。
      </p>

      <h2>真正能压的:重编码为 WebP</h2>
      <p>
        关键杠杆点是内嵌位图。现代图像格式在 PNG 体积的零头上就能达到画质平价。
        特别是 WebP,在质量 75 时通常比对应的 PNG 小约 80%,
        且对于动画帧而言肉眼几乎看不到差异。
      </p>
      <p>
        lottie-mini 压缩工具在你的浏览器里解码每张内嵌 PNG,
        通过 libwebp 的 WebAssembly 构建重编码为 WebP,
        然后原地替换 data URL。输出依然是一个自包含的 Lottie 文件,
        任何现代播放器都能消费。
      </p>

      <h2>第二个杠杆:抽帧</h2>
      <p>
        大多数以 60 fps 上线的动画,经正确重编码后从 30 fps 看起来无差别。
        许多动画在 24 fps 甚至慢变化场景的 15 fps 下都能舒适播放。
        删掉每隔一帧并相应调整 <code>ip</code>/<code>op</code> 值,
        可以把资源载荷砍半,而感知质量几乎无损失。
      </p>
      <p>
        这是压缩工具暴露的第二个调节点。结合 WebP 重编码,
        70 MB 的 Lottie 通常能落到 1 MB 以下——
        足以塞进微信小程序(总预算 2 MB)或移动端首屏 HTML 载荷里。
      </p>

      <h2>dotLottie 的细节</h2>
      <p>
        新的 <code>.lottie</code> 格式是一个 zip 容器,JSON 和图像分开存储。
        这样避免了 base64 开销,因为每张 PNG 作为二进制条目存储。
        dotLottie 比等价的内联 JSON 显著小一些,
        但内嵌的 PNG 本身依然是 PNG——没有自动转更优格式的逻辑。
      </p>
      <p>
        Inspector 和 Compressor 都把 <code>.lottie</code> 文件当一等公民处理:
        用 fflate 在浏览器里解压,在内部动画 JSON 上操作,然后重新打 zip,
        保留 manifest 和其他同级文件。
      </p>

      <h2>什么时候停下来,换成视频</h2>
      <p>
        有一条门槛之后 Lottie 就不再是合适的工具。如果你的动画本质上就是视频——
        每帧都是完全不同的渲染场景,没有共享几何——那么相同帧率的短 MP4 或 WebM
        会比任何 Lottie 等价物都小,而且 HTML5 video 是久经考验的播放器。
        Lottie 的优势(可交互、动态换色、任意 DPI 都锐利、易于代码控制)
        在内容只是像素时全部失效。
      </p>
      <p>
        一条好用的经验法则:如果你压完的 Lottie 还大于 2 MB 且时长超过 2 秒,
        检查一下同一个动画的 H.264 MP4 是不是更小。如果是,就用 MP4。
      </p>

      <h2>总结</h2>
      <p>
        Lottie 文件之所以会爆体积,是因为 Bodymovin 把无法翻译的图层用 base64 编码的 PNG 帧序列内嵌。
        常规优化工具碰不到这块——杠杆在于把那些位图帧重编码为 WebP 并降低有效帧率。
        两者结合通常能把文件压缩 50–100 倍。
        本站的 Inspector 工具一次拖入就量化了问题,Compressor 解决了它而且不上传任何数据。
      </p>
    </>
  );
}
