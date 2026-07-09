"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import lottie, { AnimationItem } from "lottie-web";
import { useLang } from "../lib/LangContext";
import { CarbonAd } from "../components/CarbonAd";
import { GoogleAd } from "../components/GoogleAd";
import { Footer } from "../components/Footer";
import { compressLottie, analyzeJson } from "../lib/lottie-compress";
import type { CompressOptions, Progress } from "../lib/lottie-compress";

const GITHUB = "https://github.com/Alex92908/lottie-mini";

type State = "idle" | "loaded" | "compressing" | "done" | "error";

interface FileInfo {
  name: string; sizeMB: string;
  imageCount: number; version: string;
  w: number; h: number; fr: number; op: number; format: string;
}

const T = {
  en: {
    sub: "Compress image-sequence Lottie files — right in your browser.",
    drop: "Drop your Lottie JSON here", or: "or click to browse",
    hint: "No upload · no size limit · 100% local",
    infoTitle: "File", size: "Size", canvas: "Canvas", dur: "Duration",
    frames: "img frames", fmt: "Frame format", sec: "s",
    noFrames: "⚠ No embedded image frames. This is a vector Lottie — nothing to compress.",
    presets: [
      { val: "quality",  label: "Quality first (~3%)",             desc: "All frames · WebP q75" },
      { val: "balanced", label: "Balanced (~1.5%) ⭐",             desc: "Half frames + WebP q75" },
      { val: "smallest", label: "Smallest (~1%)",                  desc: "Half frames + 600px + q70" },
      { val: "lossless", label: "Lossless (~50–70%)",              desc: "WebP lossless" },
      { val: "custom",   label: "Custom",                          desc: "Set params below" },
    ],
    params: "Parameters",
    quality: "WebP Quality", stride: "Frame stride",
    strides: ["1 — all frames","2 — every other (15fps)","3 — keep 1/3","4 — keep 1/4"],
    width: "Target width", widthPH: "blank = keep original",
    fmt2: "Format", losslessCb: "Lossless",
    start: "Compress", compressing: "Compressing…",
    resultTitle: "Result",
    before: "Before", after: "After", ratio: "Ratio",
    download: "↓ Download", loadAnother: "Load another",
    origLabel: "Original", compLabel: "Compressed",
    preview: "Preview", inspect: "Inspect", guide: "Guide", github: "GitHub ↗", langBtn: "中文",
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        q: "Is my file uploaded anywhere?",
        a: "No. The compressor, preview tool, and inspector all run entirely in your browser. There is no server-side processing — once the page loads, you can disconnect from the network and everything still works. Your animation never leaves your device.",
      },
      {
        q: "What's the size limit?",
        a: "There is no hard limit imposed by the tool itself. The practical ceiling depends on your browser's memory: most modern machines handle 100–200 MB Lottie files comfortably, and we've seen successful runs on files over 500 MB. The compression pipeline streams frame-by-frame rather than holding everything in memory at once.",
      },
      {
        q: "Will the compressed file play in lottie-web, lottie-react, or LottieFiles?",
        a: "Yes. The compressor produces standard Lottie JSON (or dotLottie zip) output. Every modern player — lottie-web, lottie-react, lottie-react-native, Rive's Lottie player, Bodymovin-native iOS/Android — accepts the output without configuration changes.",
      },
      {
        q: "What's the difference between the four presets?",
        a: "Quality first uses all frames at WebP quality 75 — best fidelity, typical 3% of original size. Balanced (the default) keeps every other frame at quality 75 — typical 1.5%. Smallest keeps every other frame at quality 70 and resizes to 600px wide — typical 1%. Lossless uses WebP lossless encoding with no frame skipping — typical 50–70%, useful for files that need pixel-perfect playback.",
      },
      {
        q: "Why isn't my Lottie file shrinking much?",
        a: "If embedded image assets are less than 20% of the file, the compressor has nothing to work with. Use the Inspector to see the byte breakdown. Pure-vector Lottie files are already optimally small.",
      },
      {
        q: "Does it support dotLottie (.lottie) files?",
        a: "Yes. The compressor, preview, and inspector all accept both .json and .lottie input. When you input a .lottie file, you can download the compressed result as .lottie too, preserving the original manifest and any non-animation entries.",
      },
      {
        q: "Is there a CLI or a way to batch process many files?",
        a: "The same compression logic is packaged as a Python + PyQt6 desktop GUI in the open-source repository. It supports batch processing and runs entirely offline. A standalone npm CLI is on the roadmap.",
      },
      {
        q: "Why does the compressor make my animation slightly slower?",
        a: "It shouldn't. The pipeline rewrites the layer ip/op/st values to account for any frame skipping, so the wall-clock duration stays identical. If you see a timing change, please open an issue with the source file.",
      },
    ],
    errTitle: "Error",
  },
  zh: {
    sub: "在浏览器里压缩内嵌图片帧的 Lottie 文件，不上传，无大小限制。",
    drop: "拖入 Lottie JSON", or: "或点击选择文件",
    hint: "不上传 · 无大小限制 · 完全本地",
    infoTitle: "文件", size: "大小", canvas: "画布", dur: "时长",
    frames: "图片帧", fmt: "帧格式", sec: "秒",
    noFrames: "⚠ 没有内嵌图片帧，这是矢量 Lottie，无需压缩。",
    presets: [
      { val: "quality",  label: "质量优先 (~3%)",       desc: "全帧 WebP q75" },
      { val: "balanced", label: "均衡 (~1.5%) ⭐",      desc: "抽帧到一半 + WebP q75" },
      { val: "smallest", label: "极小 (~1%)",           desc: "抽帧 + 600px + q70" },
      { val: "lossless", label: "无损 (~50–70%)",       desc: "WebP lossless" },
      { val: "custom",   label: "自定义",               desc: "手动设参数" },
    ],
    params: "参数",
    quality: "WebP 质量", stride: "抽帧步长",
    strides: ["1 — 全帧","2 — 隔帧抽 (15fps)","3 — 保留 1/3","4 — 保留 1/4"],
    width: "目标宽度", widthPH: "留空 = 保持原尺寸",
    fmt2: "格式", losslessCb: "无损",
    start: "开始压缩", compressing: "压缩中…",
    resultTitle: "压缩结果",
    before: "压缩前", after: "压缩后", ratio: "压缩比",
    download: "↓ 下载", loadAnother: "重新加载",
    origLabel: "原始", compLabel: "压缩后",
    preview: "预览对比", inspect: "文件分析", guide: "使用指南", github: "GitHub ↗", langBtn: "EN",
    faqHeading: "常见问题",
    faqs: [
      {
        q: "我的文件会被上传到任何地方吗?",
        a: "不会。压缩、预览、分析三个工具完全在你的浏览器里运行。没有服务器端处理——页面加载完之后,你可以断开网络,所有功能仍然能用。你的动画文件永远不会离开你的设备。",
      },
      {
        q: "有大小限制吗?",
        a: "工具本身没有硬性限制。实际上限取决于浏览器内存:大多数现代电脑能舒服地处理 100–200 MB 的 Lottie 文件,我们也见过 500 MB 以上文件成功跑完的案例。压缩管线是逐帧流式处理的,不会把所有数据同时塞进内存。",
      },
      {
        q: "压缩后的文件能在 lottie-web、lottie-react、LottieFiles 里播放吗?",
        a: "可以。压缩器产出标准的 Lottie JSON(或 dotLottie zip)。所有现代播放器——lottie-web、lottie-react、lottie-react-native、Rive 的 Lottie 播放器、Bodymovin 的 iOS/Android 原生播放器——都能无需任何配置改动直接消费输出。",
      },
      {
        q: "四个预设的区别是什么?",
        a: "「质量优先」使用全帧 + WebP 质量 75——保真度最高,典型大小为原始的 3%。「均衡」(默认)隔帧抽帧 + 质量 75——典型 1.5%。「极小」隔帧抽帧 + 质量 70 + 缩放到 600px 宽——典型 1%。「无损」使用 WebP 无损编码不抽帧——典型 50-70%,适合需要像素级精确播放的场景。",
      },
      {
        q: "我的 Lottie 文件为什么压不下去?",
        a: "如果内嵌图像资源占文件不到 20%,压缩器就没有可操作的空间。用 Inspector 工具查看字节构成。纯矢量 Lottie 本身已经达到最优体积。",
      },
      {
        q: "支持 dotLottie (.lottie) 格式吗?",
        a: "支持。压缩、预览、分析都接受 .json 和 .lottie 输入。当你输入 .lottie 文件时,可以选择压缩后的结果也以 .lottie 格式下载,保留原始 manifest 和任何非动画条目。",
      },
      {
        q: "有命令行工具或者批量处理的方法吗?",
        a: "同样的压缩逻辑被打包成 Python + PyQt6 桌面 GUI,在开源仓库里。它支持批量处理,完全离线运行。独立的 npm CLI 在 roadmap 上。",
      },
      {
        q: "压缩后动画为什么变慢了一点?",
        a: "理论上不会。管线会重写图层的 ip/op/st 值来抵消任何抽帧,所以墙钟时长保持完全一致。如果你看到时序变化,请带上原始文件提 issue。",
      },
    ],
    errTitle: "错误",
  },
} as const;

const PRESET_OPTS: Record<string, Partial<CompressOptions>> = {
  quality:  { quality: 75, stride: 1, targetWidth: undefined, lossless: false, outputFormat: "webp" },
  balanced: { quality: 75, stride: 2, targetWidth: undefined, lossless: false, outputFormat: "webp" },
  smallest: { quality: 70, stride: 2, targetWidth: 600,       lossless: false, outputFormat: "webp" },
  lossless: { quality: 100, stride: 1, targetWidth: undefined, lossless: true,  outputFormat: "webp" },
};

function fmt(bytes: number) { return (bytes / 1024 / 1024).toFixed(2) + " MB"; }
function yld() { return new Promise<void>((r) => setTimeout(r, 0)); }

// ---- side-by-side player ----
function ComparePlayer({
  origJson, compJson, origLabel, compLabel,
}: {
  origJson: Record<string, unknown>;
  compJson: Record<string, unknown>;
  origLabel: string; compLabel: string;
}) {
  const origRef = useRef<HTMLDivElement>(null);
  const compRef = useRef<HTMLDivElement>(null);
  const anims = useRef<AnimationItem[]>([]);

  useEffect(() => {
    anims.current.forEach((a) => a.destroy());
    anims.current = [];
    if (!origRef.current || !compRef.current) return;
    const cfg = { renderer: "canvas" as const, loop: true, autoplay: true,
      rendererSettings: { clearCanvas: true, preserveAspectRatio: "xMidYMid meet" } };
    anims.current.push(
      lottie.loadAnimation({ ...cfg, container: origRef.current, animationData: origJson }),
      lottie.loadAnimation({ ...cfg, container: compRef.current, animationData: compJson }),
    );
    return () => anims.current.forEach((a) => a.destroy());
  }, [origJson, compJson]);

  return (
    <div className="compare-players">
      <div className="cplayer">
        <div className="cplayer-label">{origLabel}</div>
        <div ref={origRef} className="cplayer-canvas" />
      </div>
      <div className="cplayer">
        <div className="cplayer-label">{compLabel}</div>
        <div ref={compRef} className="cplayer-canvas" />
      </div>
    </div>
  );
}

// ---- main page ----
export default function Home() {
  const { lang, toggle } = useLang();
  const t = T[lang];

  const [state, setState] = useState<State>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [rawJson, setRawJson] = useState<Record<string, unknown> | null>(null);
  const [rawSize, setRawSize] = useState(0);
  const [preset, setPreset] = useState("balanced");
  const [opts, setOpts] = useState<CompressOptions>(
    { quality: 75, stride: 2, lossless: false, outputFormat: "webp" }
  );
  const [progress, setProgress] = useState<Progress>({ pct: 0, msg: "" });
  const [result, setResult] = useState<{
    url: string; size: number; name: string;
    compJson: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    setError(""); setResult(null); setRawJson(null); setFileInfo(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target!.result as string);
        setRawJson(json); setRawSize(file.size);
        setFileInfo({ name: file.name, sizeMB: fmt(file.size), ...analyzeJson(json) });
        setState("loaded");
      } catch { setError("JSON parse failed"); setState("error"); }
    };
    reader.readAsText(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) loadFile(f);
  }, [loadFile]);

  const applyPreset = (val: string) => {
    setPreset(val);
    if (val !== "custom") setOpts((o) => ({ ...o, ...PRESET_OPTS[val] }));
  };

  const startCompress = async () => {
    if (!rawJson) return;
    setState("compressing"); setProgress({ pct: 0, msg: "" });
    try {
      let pct = 0;
      const compJson = await compressLottie(rawJson, opts, (p) => {
        setProgress(p); pct = p.pct;
        if (pct % 5 === 0) yld();
      });
      const str = JSON.stringify(compJson);
      const blob = new Blob([str], { type: "application/json" });
      const base = fileInfo!.name.replace(/\.json$/i, "");
      setResult({ url: URL.createObjectURL(blob), size: blob.size,
        name: `${base}_compressed.json`, compJson });
      setState("done");
    } catch (e) { setError(String(e)); setState("error"); }
  };

  const reset = () => {
    setState("idle"); setFileInfo(null); setRawJson(null);
    setResult(null); setError(""); setProgress({ pct: 0, msg: "" });
  };

  return (
    <>
      <nav>
        <div className="nav-inner">
          <img src="/logo-text.svg" alt="lottie-mini" height={36} style={{ display: "block" }} />
          <div className="nav-links">
            <Link href="/preview">{t.preview}</Link>
            <Link href="/inspect">{t.inspect}</Link>
            <Link href="/guide">{t.guide}</Link>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer">{t.github}</a>
            <button className="lang-toggle" onClick={toggle}>{t.langBtn}</button>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
          <div className="home-hero">
            <h1>lottie<span style={{ color: "var(--accent2)" }}>-mini</span></h1>
            <p>{t.sub}</p>
          </div>

          {/* Drop zone */}
          {state === "idle" && (
            <div
              className={`compress-drop${dragging ? " dragging" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".json" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
              <div className="drop-icon">🗜️</div>
              <div className="drop-text">{t.drop}</div>
              <div className="drop-sub">{t.or}</div>
              <div className="drop-hint">{t.hint}</div>
            </div>
          )}

          {/* Ads — shown while idle */}
          {state === "idle" && (
            <div className="ad-row">
              <CarbonAd />
              <GoogleAd />
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="compress-error">
              <strong>{t.errTitle}:</strong> {error}
              <button className="ctrl-btn" style={{ marginLeft: 16 }} onClick={reset}>↩</button>
            </div>
          )}

          {/* Panel */}
          {(state === "loaded" || state === "compressing" || state === "done") && fileInfo && (
            <div className="compress-panel">

              {/* File info */}
              <div className="cpanel-section">
                <div className="cpanel-title">{t.infoTitle}</div>
                <div className="file-info-grid">
                  <span className="fi-key">{t.size}</span>
                  <span className="fi-val">{fileInfo.sizeMB}</span>
                  <span className="fi-key">{t.canvas}</span>
                  <span className="fi-val">{fileInfo.w} × {fileInfo.h} @ {fileInfo.fr} fps</span>
                  <span className="fi-key">{t.dur}</span>
                  <span className="fi-val">{fileInfo.op} frames (~{(fileInfo.op / Math.max(fileInfo.fr, 1)).toFixed(1)}{t.sec})</span>
                  <span className="fi-key">{t.frames}</span>
                  <span className="fi-val" style={{ color: fileInfo.imageCount > 0 ? "var(--green)" : "var(--red)" }}>
                    {fileInfo.imageCount > 0 ? fileInfo.imageCount : t.noFrames}
                  </span>
                  {fileInfo.imageCount > 0 && <>
                    <span className="fi-key">{t.fmt}</span>
                    <span className="fi-val">{fileInfo.format}</span>
                  </>}
                </div>
              </div>

              {fileInfo.imageCount > 0 && state !== "done" && (<>
                {/* Presets */}
                <div className="cpanel-section">
                  <div className="preset-list">
                    {t.presets.map((p) => (
                      <label key={p.val} className={`preset-row${preset === p.val ? " active" : ""}`}>
                        <input type="radio" name="preset" value={p.val}
                          checked={preset === p.val} onChange={() => applyPreset(p.val)}
                          style={{ accentColor: "var(--accent)" }} />
                        <span className="preset-label">{p.label}</span>
                        <span className="preset-desc">{p.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom params */}
                {preset === "custom" && (
                  <div className="cpanel-section">
                    <div className="cpanel-title">{t.params}</div>
                    <div className="param-grid">
                      <label className="param-label">{t.quality} <span style={{ color: "var(--accent2)" }}>{opts.quality}</span></label>
                      <input type="range" min={30} max={100} value={opts.quality}
                        onChange={(e) => setOpts((o) => ({ ...o, quality: +e.target.value }))}
                        style={{ width: "100%", accentColor: "var(--accent)" }} />
                      <label className="param-label">{t.stride}</label>
                      <select className="param-select" value={opts.stride}
                        onChange={(e) => setOpts((o) => ({ ...o, stride: +e.target.value }))}>
                        {t.strides.map((s, i) => <option key={i} value={i + 1}>{s}</option>)}
                      </select>
                      <label className="param-label">{t.width}</label>
                      <input className="param-input" type="number" min={1} placeholder={t.widthPH}
                        value={opts.targetWidth ?? ""}
                        onChange={(e) => setOpts((o) => ({ ...o, targetWidth: e.target.value ? +e.target.value : undefined }))} />
                      <label className="param-label">{t.fmt2}</label>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <select className="param-select" style={{ width: 100 }} value={opts.outputFormat}
                          onChange={(e) => setOpts((o) => ({ ...o, outputFormat: e.target.value as "webp" | "png" }))}>
                          <option value="webp">webp</option>
                          <option value="png">png</option>
                        </select>
                        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
                          <input type="checkbox" checked={opts.lossless}
                            onChange={(e) => setOpts((o) => ({ ...o, lossless: e.target.checked }))}
                            style={{ accentColor: "var(--accent)" }} />
                          {t.losslessCb}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress */}
                {state === "compressing" && (
                  <div className="cpanel-section">
                    <div className="compress-bar-track">
                      <div className="compress-bar-fill" style={{ width: `${progress.pct}%` }} />
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{progress.msg}</div>
                  </div>
                )}

                {/* Start */}
                {state === "loaded" && (
                  <div className="cpanel-section">
                    <button className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                      onClick={startCompress}>
                      {t.start}
                    </button>
                  </div>
                )}
              </>)}

              {/* Result + compare */}
              {state === "done" && result && rawJson && (
                <>
                  <div className="cpanel-section">
                    <div className="cpanel-title">{t.resultTitle}</div>
                    <div className="result-row">
                      <div className="result-stat">
                        <div className="result-val" style={{ color: "var(--muted)" }}>{fmt(rawSize)}</div>
                        <div className="result-key">{t.before}</div>
                      </div>
                      <div className="result-arrow">→</div>
                      <div className="result-stat">
                        <div className="result-val" style={{ color: "var(--green)" }}>{fmt(result.size)}</div>
                        <div className="result-key">{t.after}</div>
                      </div>
                      <div className="result-stat">
                        <div className="result-val" style={{ color: "var(--accent2)" }}>
                          {(rawSize / result.size).toFixed(1)}×
                        </div>
                        <div className="result-key">{t.ratio}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                      <a className="btn btn-primary" href={result.url} download={result.name}>{t.download}</a>
                      <button className="btn btn-ghost" onClick={reset}>{t.loadAnother}</button>
                    </div>
                  </div>

                  {/* Side-by-side player */}
                  <div className="cpanel-section">
                    <ComparePlayer
                      origJson={rawJson} compJson={result.compJson}
                      origLabel={t.origLabel} compLabel={t.compLabel}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          {/* FAQ — visible when idle so AdSense sees content */}
          {state === "idle" && (
            <section className="faq-list">
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, marginTop: 60 }}>
                {t.faqHeading}
              </h2>
              {t.faqs.map((f, i) => (
                <div key={i} className="faq-item">
                  <div className="faq-q">{f.q}</div>
                  <p className="faq-a">{f.a}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
