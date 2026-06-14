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
      <h1>How the lottie-mini compressor works</h1>
      <p className="lede">
        A technical walkthrough of the compression pipeline that turns a 70 MB Lottie file into
        an ~800 KB equivalent — entirely in your browser, with no server in the loop.
        This article documents the design choices, what runs where, and why each one matters.
      </p>

      <h2>Stage 0: Reading the file</h2>
      <p>
        The user drops a <code>.json</code> or <code>.lottie</code> file onto the page.
        Plain JSON files are read via the File API's <code>readAsText</code> method into a single string,
        then <code>JSON.parse</code>'d. The <code>.lottie</code> case is more interesting:
        the file is a standard zip archive, which we unpack in-browser using
        the <code>fflate</code> library — a 6 KB pure-JavaScript zip implementation with no native dependency.
        We extract the first <code>animations/*.json</code> entry, which is the animation
        proper, and keep the original buffer around so we can re-zip later if the user wants
        a <code>.lottie</code> output.
      </p>

      <h2>Stage 1: Identifying compressible assets</h2>
      <p>
        With the JSON in hand, we walk the top-level <code>assets</code> array.
        Each entry that is an embedded image has a <code>p</code> field starting with <code>data:image/</code>.
        These are the only entries we'll touch — sub-composition assets are passed through unchanged.
      </p>
      <p>
        For each image asset we extract: the MIME type (from the data URL header), the base64 payload
        length (a proxy for the JSON byte cost of this asset), and the binary decoded length
        (the actual image size after base64 decoding). The asset table on the Inspector page
        sorts by the first number, because that's what actually drives file size in JSON.
      </p>

      <h2>Stage 2: Frame stride</h2>
      <p>
        Before re-encoding individual frames, we optionally drop frames at a configurable stride.
        Stride 2 keeps every other frame (60 fps becomes 30 fps); stride 3 keeps every third
        (60 becomes 20); stride 4 keeps a quarter. This is the highest-leverage knob in the entire
        pipeline because dropping frames doesn't just cut the encode work — it cuts the file size
        proportionally with no per-frame quality loss.
      </p>
      <p>
        The catch is that we have to rewrite the animation timeline so playback timing stays correct.
        The Lottie format uses <code>ip</code> (in point) and <code>op</code> (out point) values on each
        layer, plus a per-layer <code>st</code> (start time). Skipping frames means the surviving frames
        play faster than originally intended unless we adjust these values. Our pipeline scales them
        by the inverse of the stride.
      </p>

      <h2>Stage 3: PNG decoding</h2>
      <p>
        For each surviving image asset, we slice the base64 payload off the data URL,
        decode it to a Uint8Array, and load it into an <code>OffscreenCanvas</code> via
        <code>createImageBitmap</code>. This step happens in a Web Worker so the main thread
        stays responsive during the (potentially slow) decoding of dozens of large PNGs.
      </p>
      <p>
        OffscreenCanvas is well-supported in modern browsers (Chrome, Edge, Firefox, Safari 16.4+).
        For older browsers we fall back to a regular <code>HTMLCanvasElement</code> on the main thread —
        slower but functional.
      </p>

      <h2>Stage 4: WebP encoding</h2>
      <p>
        The decoded pixel data is then re-encoded as WebP. We bundle a WebAssembly build of Google's
        official <code>libwebp</code> encoder. Why WebAssembly rather than the browser's
        built-in <code>canvas.toBlob("image/webp")</code>? Two reasons:
      </p>
      <ul>
        <li><strong>Quality parameter control.</strong> Browser implementations differ in how they
          interpret the <code>quality</code> argument. Some maps to libwebp's "method" parameter,
          some to a custom internal heuristic. Bundling libwebp directly gives us deterministic output.</li>
        <li><strong>Alpha handling.</strong> Lottie embedded PNGs frequently contain alpha channels.
          The browser's encoder has historical bugs around alpha (especially in lossless mode) that
          libwebp doesn't.</li>
      </ul>
      <p>
        The encoder runs at user-selectable quality 30–100 (default 75). Quality 75 typically achieves
        80% size reduction versus the source PNG with no perceptible quality difference for animation frames.
        Lower quality compresses more but starts to show ringing artifacts on hard edges below quality 50.
      </p>

      <h2>Stage 5: Re-inlining</h2>
      <p>
        The output WebP binary is re-encoded as base64 and assembled into a new data URL
        (<code>data:image/webp;base64,...</code>). The <code>p</code> field of the original asset is
        replaced with this new URL. If the asset's MIME type changed (PNG → WebP), we also update
        any nested type hints in the asset entry.
      </p>

      <h2>Stage 6: Timeline finalization</h2>
      <p>
        With all surviving frames re-encoded, we make one final pass over the layer tree
        to apply the frame-stride scaling to <code>ip</code>, <code>op</code>, <code>st</code>,
        and any time-mapped keyframes. The composition's top-level <code>op</code> (total duration)
        is also adjusted so the animation runs the same wall-clock duration as the original.
      </p>

      <h2>Stage 7: Serialization and download</h2>
      <p>
        The modified JSON is serialized with <code>JSON.stringify</code>. For <code>.json</code> input,
        we wrap it in a <code>Blob</code> and offer a download. For <code>.lottie</code> input,
        we re-zip using fflate, replacing the original animation entry while preserving the manifest
        and any sibling image files, then offer that zip as a <code>.lottie</code> download.
      </p>

      <h2>What stays out of the pipeline</h2>
      <p>
        We deliberately do not touch:
      </p>
      <ul>
        <li><strong>Bodymovin expressions</strong> — these are JavaScript-like code blocks bound to properties.
          Compression would risk silently breaking interactive animations.</li>
        <li><strong>Shape layer geometry</strong> — vector data is essentially free. Touching it
          for marginal byte savings risks visual degradation.</li>
        <li><strong>Layer order or naming</strong> — players sometimes key off layer names for runtime
          targeting (e.g. color theming). We preserve the original tree exactly.</li>
      </ul>
      <p>
        This conservative scope is why lottie-mini's output drops into existing players without
        configuration changes. The compressed file looks identical to the original to every
        Lottie player on the market — only smaller.
      </p>

      <h2>Why fully client-side?</h2>
      <p>
        Server-side compression would be more efficient per-byte (no JavaScript overhead, no
        WebAssembly indirection, no browser security boundaries). We chose client-side anyway
        because:
      </p>
      <ul>
        <li><strong>Confidentiality.</strong> Many of the Lottie files people want to compress are
          unreleased brand assets. Uploading them anywhere introduces risk the operator may not have
          authority to accept.</li>
        <li><strong>No size limits.</strong> Server-side requires upload bandwidth; very large files
          time out or get rejected at the gateway. In-browser processing has no such ceiling.</li>
        <li><strong>No infrastructure cost.</strong> The site is a static export hosted on Vercel's
          free tier. There's no compute to pay for, no rate limiting to enforce, no quota to police.</li>
      </ul>

      <h2>Where the gains come from, quantitatively</h2>
      <p>
        For a representative 70 MB Lottie file with embedded PNG frames at quality 75 and stride 2:
      </p>
      <ul>
        <li>PNG → WebP at q75: 70 MB → ~14 MB (80% reduction on the raster bytes)</li>
        <li>Frame stride 2: 14 MB → ~7 MB (50% reduction on frame count)</li>
        <li>Vector + structural data: ~50 KB, unchanged</li>
        <li>Total: 70 MB → ~7 MB at conservative settings</li>
      </ul>
      <p>
        With the Smallest preset (quality 70, stride 2, target width 600px) the same file typically lands
        under 1 MB — a 70-100× reduction.
      </p>

      <h2>Source code</h2>
      <p>
        The compression core lives in the open-source repository at <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">github.com/Alex92908/lottie-mini</a>.
        The web/lib/lottie-compress.ts file contains the main pipeline; the same logic is also packaged
        as a Python + PyQt6 desktop GUI in the same repository, useful for batch processing.
      </p>
    </>
  );
}

function Zh() {
  return (
    <>
      <h1>lottie-mini 压缩工具的工作原理</h1>
      <p className="lede">
        把 70 MB Lottie 文件压成约 800 KB 等价物的技术管线讲解——全程在你的浏览器里完成,
        没有任何服务器参与。这篇文章记录了设计选择、什么跑在哪里、以及每个选择为何重要。
      </p>

      <h2>阶段 0:读取文件</h2>
      <p>
        用户把 <code>.json</code> 或 <code>.lottie</code> 文件拖入页面。
        纯 JSON 文件用 File API 的 <code>readAsText</code> 读成字符串,然后 <code>JSON.parse</code>。
        <code>.lottie</code> 的情况更有意思:它是标准 zip 归档,
        我们用 <code>fflate</code> 库在浏览器里解压——一个 6 KB 的纯 JavaScript zip 实现,无原生依赖。
        我们提取第一个 <code>animations/*.json</code> 条目,这是动画本体,
        并保留原始 buffer 以便用户想要 <code>.lottie</code> 输出时能重新打包。
      </p>

      <h2>阶段 1:识别可压缩资源</h2>
      <p>
        拿到 JSON 后,我们遍历顶层 <code>assets</code> 数组。
        每个内嵌图像条目的 <code>p</code> 字段以 <code>data:image/</code> 开头。
        我们只动这些条目——子合成资源原样透传。
      </p>
      <p>
        对每个图像资源我们提取:MIME 类型(从 data URL 头)、base64 载荷长度(代表这个资源在 JSON 里的字节成本)、
        以及二进制解码后长度(base64 解码后的实际图像大小)。
        Inspector 页面的资源表按第一个数字排序,因为那才是真正决定 JSON 体积的。
      </p>

      <h2>阶段 2:抽帧</h2>
      <p>
        在重编码单帧之前,我们可选地按可配置的步长抽帧。步长 2 保留每隔一帧(60 fps 变 30 fps);
        步长 3 保留每三帧之一(60 变 20);步长 4 保留四分之一。
        这是整个管线里杠杆最大的旋钮,因为抽帧不仅减少了编码工作量,
        还按比例减小了文件体积,而且没有单帧画质损失。
      </p>
      <p>
        代价是我们必须重写动画时间轴,让播放时序保持正确。
        Lottie 格式在每个图层上有 <code>ip</code>(起始帧)和 <code>op</code>(结束帧)值,
        外加每层的 <code>st</code>(开始时间)。抽帧意味着幸存的帧播放速度比原定快,
        除非我们调整这些值。我们的管线按步长的倒数缩放它们。
      </p>

      <h2>阶段 3:PNG 解码</h2>
      <p>
        对每个幸存的图像资源,我们从 data URL 切出 base64 载荷、解码成 Uint8Array,
        通过 <code>createImageBitmap</code> 加载到 <code>OffscreenCanvas</code>。
        这一步在 Web Worker 里跑,这样主线程在(可能很慢的)解码数十张大 PNG 时保持响应。
      </p>
      <p>
        OffscreenCanvas 在现代浏览器里支持良好(Chrome、Edge、Firefox、Safari 16.4+)。
        旧浏览器我们回退到主线程上的普通 <code>HTMLCanvasElement</code>——慢但能用。
      </p>

      <h2>阶段 4:WebP 编码</h2>
      <p>
        解码后的像素数据然后被重编码为 WebP。我们打包了 Google 官方 <code>libwebp</code> 编码器的 WebAssembly 构建。
        为什么用 WebAssembly 而不是浏览器内置的 <code>canvas.toBlob("image/webp")</code>?两个原因:
      </p>
      <ul>
        <li><strong>质量参数控制。</strong>不同浏览器对 <code>quality</code> 参数的解释不一致。
          有些映射到 libwebp 的 "method" 参数,有些映射到自定义启发式。直接打包 libwebp 给我们确定性输出。</li>
        <li><strong>Alpha 处理。</strong>Lottie 内嵌 PNG 经常带 alpha 通道。
          浏览器编码器在 alpha 上有历史 bug(特别是无损模式),libwebp 没有。</li>
      </ul>
      <p>
        编码器以用户可选质量 30–100 运行(默认 75)。质量 75 通常相对源 PNG 减少 80% 体积,
        且对动画帧的画质几乎无差异。质量更低压缩更多,但 50 以下开始在硬边出现振铃伪影。
      </p>

      <h2>阶段 5:重新内联</h2>
      <p>
        输出的 WebP 二进制被重新 base64 编码,组装成新 data URL(<code>data:image/webp;base64,...</code>)。
        原始资源的 <code>p</code> 字段被替换为这个新 URL。
        如果资源的 MIME 类型改变了(PNG → WebP),我们也更新资源条目里的任何嵌套类型提示。
      </p>

      <h2>阶段 6:时间轴收尾</h2>
      <p>
        所有幸存帧重编码完毕后,我们对图层树做最后一遍,把抽帧缩放应用到
        <code>ip</code>、<code>op</code>、<code>st</code>,以及任何时间映射关键帧。
        合成的顶层 <code>op</code>(总时长)也调整,让动画跑出与原始相同的墙钟时长。
      </p>

      <h2>阶段 7:序列化与下载</h2>
      <p>
        修改后的 JSON 用 <code>JSON.stringify</code> 序列化。<code>.json</code> 输入,
        我们包成 <code>Blob</code> 并提供下载。<code>.lottie</code> 输入,
        我们用 fflate 重新打 zip,替换原动画条目,同时保留 manifest 和任何同级图像文件,
        然后把那个 zip 作为 <code>.lottie</code> 下载提供。
      </p>

      <h2>故意不动的部分</h2>
      <p>
        我们刻意不碰:
      </p>
      <ul>
        <li><strong>Bodymovin 表达式</strong>——这些是绑定到属性的类 JavaScript 代码块。
          压缩它们有静默破坏可交互动画的风险。</li>
        <li><strong>形状层几何</strong>——矢量数据基本免费。
          为边际字节收益去碰它们,有视觉退化的风险。</li>
        <li><strong>图层顺序或命名</strong>——播放器有时按图层名做运行时定位(比如颜色主题化)。
          我们保留原树完全不动。</li>
      </ul>
      <p>
        这种保守范围正是为什么 lottie-mini 的输出能直接落入现有播放器,无需配置改动。
        压缩后的文件对市面上所有 Lottie 播放器看起来都和原始文件完全一样——只是更小。
      </p>

      <h2>为什么完全在客户端?</h2>
      <p>
        服务端压缩按字节算更高效(无 JavaScript 开销、无 WebAssembly 间接、无浏览器安全边界)。
        我们还是选客户端,因为:
      </p>
      <ul>
        <li><strong>机密性。</strong>许多人想压的 Lottie 文件是未发布的品牌资产。
          上传到任何地方都引入操作员可能无权接受的风险。</li>
        <li><strong>无大小限制。</strong>服务端需要上传带宽;非常大的文件会超时或在网关被拒。
          浏览器内处理没有这种天花板。</li>
        <li><strong>无基础设施成本。</strong>站点是静态导出,托管在 Vercel 免费层。
          没有计算费用要付,没有限流要执行,没有配额要管。</li>
      </ul>

      <h2>收益量化</h2>
      <p>
        典型的 70 MB Lottie 文件,内嵌 PNG 帧,质量 75 和步长 2:
      </p>
      <ul>
        <li>PNG → WebP q75:70 MB → 约 14 MB(位图字节减少 80%)</li>
        <li>抽帧 2:14 MB → 约 7 MB(帧数减少 50%)</li>
        <li>矢量 + 结构数据:约 50 KB,不变</li>
        <li>总计:70 MB → 约 7 MB(保守设置)</li>
      </ul>
      <p>
        用"极小"预设(质量 70、步长 2、目标宽度 600 像素)同一文件通常落到 1 MB 以下——70-100× 压缩。
      </p>

      <h2>源代码</h2>
      <p>
        压缩核心位于开源仓库 <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">github.com/Alex92908/lottie-mini</a>。
        web/lib/lottie-compress.ts 文件包含主管线;
        同样的逻辑也以 Python + PyQt6 桌面 GUI 打包在同一仓库里,适合批量处理。
      </p>
    </>
  );
}
