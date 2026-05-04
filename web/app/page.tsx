"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import lottie, { AnimationItem } from "lottie-web";
import { useLang } from "../lib/LangContext";
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
    preview: "Preview", github: "GitHub ↗", langBtn: "中文",
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
    preview: "预览对比", github: "GitHub ↗", langBtn: "EN",
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
          <span className="nav-logo">lottie<span>-mini</span></span>
          <div className="nav-links">
            <Link href="/preview">{t.preview}</Link>
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
        </div>
      </main>

    </>
  );
}
