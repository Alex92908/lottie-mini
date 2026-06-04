"use client";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "../../lib/LangContext";
import { parseDotLottie, isDotLottie } from "../../lib/dotlottie";
import { inspectLottie, fmtBytes } from "../../lib/inspect";
import type { InspectReport } from "../../lib/inspect";
import JsonTree from "./JsonTree";
import { CarbonAd } from "../../components/CarbonAd";
import { GoogleAd } from "../../components/GoogleAd";

type State = "idle" | "loaded" | "error";

const T = {
  en: {
    title: "Lottie Inspector",
    sub: "Drop a .json or .lottie file to see exactly what's inside — structural overview, the largest embedded assets, and a searchable, collapsible tree of every key.",
    drop: "Drop Lottie JSON or .lottie here",
    or: "or click to browse",
    hint: "Any size · 100% local · no upload",
    back: "← Back",
    errTitle: "Error",
    errParse: "Failed to parse file.",
    reset: "Load another file",

    overviewLabel: "Overview",
    breakdown: "Composition",
    breakdownVector: "Vector + structure",
    breakdownEmbedded: "Embedded raster",
    metaVersion: "Lottie version",
    metaCanvas: "Canvas",
    metaFps: "fps",
    metaDuration: "Duration",
    metaFrames: "frames",
    metaSec: "s",
    metaComps: "Compositions",
    metaLayers: "Layers",
    metaShapes: "Shapes",
    metaEmbedded: "Embedded assets",

    topTitle: "Largest embedded assets",
    topSub: "These are the items inflating the file. Compress them and the size collapses.",
    colId: "Asset ID",
    colType: "Type",
    colJson: "Size in JSON",
    colDecoded: "Decoded",
    colPct: "% of file",
    topEmpty: "No embedded raster assets — this is a pure vector Lottie. Nothing to compress.",
    topCta: "Try the Compressor →",

    treeTitle: "Full JSON tree",
    treeSub: "Search any key or value; matching branches auto-expand.",
  },
  zh: {
    title: "Lottie 文件分析",
    sub: "拖入 .json 或 .lottie 文件,一眼看清结构:体积构成、最大的内嵌资源、可搜索可折叠的完整 JSON 树。",
    drop: "拖入 Lottie JSON 或 .lottie",
    or: "或点击选择文件",
    hint: "任意大小 · 完全本地 · 不上传",
    back: "← 返回",
    errTitle: "错误",
    errParse: "文件解析失败。",
    reset: "重新加载文件",

    overviewLabel: "结构概览",
    breakdown: "体积构成",
    breakdownVector: "矢量 + 结构数据",
    breakdownEmbedded: "内嵌位图",
    metaVersion: "Lottie 版本",
    metaCanvas: "画布",
    metaFps: "fps",
    metaDuration: "时长",
    metaFrames: "帧",
    metaSec: "秒",
    metaComps: "合成数",
    metaLayers: "图层数",
    metaShapes: "图形数",
    metaEmbedded: "内嵌资源",

    topTitle: "最大的内嵌资源",
    topSub: "这些就是把文件撑大的元凶。压一压,体积立刻塌下来。",
    colId: "资源 ID",
    colType: "类型",
    colJson: "JSON 占用",
    colDecoded: "解码后",
    colPct: "占整体",
    topEmpty: "没有内嵌位图——这是纯矢量 Lottie,无需压缩。",
    topCta: "去压缩工具 →",

    treeTitle: "完整 JSON 树",
    treeSub: "支持搜索 key 或 value,命中的分支会自动展开。",
  },
} as const;

export default function InspectPage() {
  const { lang, toggle } = useLang();
  const t = T[lang];

  const [state, setState] = useState<State>("idle");
  const [dragging, setDragging] = useState(false);
  const [json, setJson] = useState<Record<string, unknown> | null>(null);
  const [report, setReport] = useState<InspectReport | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (file: File) => {
    setError(""); setJson(null); setReport(null);
    try {
      let parsed: Record<string, unknown>;
      if (isDotLottie(file)) {
        const buf = await file.arrayBuffer();
        parsed = await parseDotLottie(buf);
      } else {
        const text = await file.text();
        parsed = JSON.parse(text);
      }
      const rep = inspectLottie(parsed, file.size);
      setJson(parsed);
      setReport(rep);
      setFileName(file.name);
      setState("loaded");
    } catch (e) {
      setError(`${t.errParse} ${e instanceof Error ? e.message : ""}`);
      setState("error");
    }
  }, [t.errParse]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  }, [loadFile]);

  const reset = () => {
    setState("idle");
    setJson(null); setReport(null); setFileName(""); setError("");
  };

  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link href="/" style={{ display: "block" }}>
            <img src="/logo-text.svg" alt="lottie-mini" height={36} style={{ display: "block" }} />
          </Link>
          <div className="nav-links">
            <Link href="/">{t.back}</Link>
            <button className="lang-toggle" onClick={toggle}>
              {lang === "en" ? "中文" : "EN"}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
          <div style={{ padding: "48px 0 24px", textAlign: "center" }}>
            <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
              {t.title}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 560, margin: "0 auto" }}>{t.sub}</p>
          </div>

          {state === "idle" && (
            <div
              className={`compress-drop${dragging ? " dragging" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".json,.lottie"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
              />
              <div className="drop-icon">🔍</div>
              <div className="drop-text">{t.drop}</div>
              <div className="drop-sub">{t.or}</div>
              <div className="drop-hint">{t.hint}</div>
            </div>
          )}

          {state === "error" && (
            <div className="compress-error">
              <strong>{t.errTitle}:</strong> {error}
              <button className="ctrl-btn" style={{ marginLeft: 16 }} onClick={reset}>↩</button>
            </div>
          )}

          {state === "loaded" && report && json && (
            <>
              {/* Overview */}
              <div className="compress-panel" style={{ marginBottom: 32 }}>
                <div className="cpanel-section">
                  <div className="cpanel-title">
                    {t.overviewLabel} · <span style={{ textTransform: "none", color: "var(--text)", fontWeight: 600 }}>{fileName}</span>
                    <button className="ctrl-btn" style={{ float: "right", marginTop: -4 }} onClick={reset}>{t.reset}</button>
                  </div>

                  {/* Breakdown bar */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                      {t.breakdown} · {fmtBytes(report.totalBytes)}
                    </div>
                    <div className="ins-stack">
                      <div
                        className="ins-stack-vec"
                        style={{ width: `${100 - report.embeddedPct}%` }}
                        title={`${t.breakdownVector}: ${fmtBytes(report.vectorBytes)}`}
                      />
                      <div
                        className="ins-stack-raster"
                        style={{ width: `${report.embeddedPct}%` }}
                        title={`${t.breakdownEmbedded}: ${fmtBytes(report.embeddedBytes)}`}
                      />
                    </div>
                    <div className="ins-legend">
                      <span><i className="ins-dot ins-dot-vec" /> {t.breakdownVector} · {fmtBytes(report.vectorBytes)} ({(100 - report.embeddedPct).toFixed(1)}%)</span>
                      <span><i className="ins-dot ins-dot-raster" /> {t.breakdownEmbedded} · {fmtBytes(report.embeddedBytes)} ({report.embeddedPct.toFixed(1)}%)</span>
                    </div>
                  </div>

                  {/* Meta grid */}
                  <div className="ins-meta-grid">
                    <Metric label={t.metaVersion} value={report.version} />
                    <Metric label={t.metaCanvas} value={`${report.width} × ${report.height}`} />
                    <Metric label={t.metaFps} value={String(report.fps)} />
                    <Metric label={t.metaDuration} value={`${report.durationFrames} ${t.metaFrames} · ${report.durationSec}${t.metaSec}`} />
                    <Metric label={t.metaComps} value={String(report.compositionCount)} />
                    <Metric label={t.metaLayers} value={String(report.layerCount)} />
                    <Metric label={t.metaShapes} value={String(report.shapeCount)} />
                    <Metric label={t.metaEmbedded} value={String(report.embeddedCount)} accent={report.embeddedCount > 0} />
                  </div>
                </div>
              </div>

              {/* Top assets */}
              <div className="compress-panel" style={{ marginBottom: 32 }}>
                <div className="cpanel-section">
                  <div className="cpanel-title">{t.topTitle}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{t.topSub}</div>

                  {report.topAssets.length === 0 ? (
                    <div style={{ fontSize: 14, color: "var(--muted)", padding: "12px 0" }}>{t.topEmpty}</div>
                  ) : (
                    <>
                      <div className="ins-table-wrap">
                        <table className="ins-table">
                          <thead>
                            <tr>
                              <th>{t.colId}</th>
                              <th>{t.colType}</th>
                              <th style={{ textAlign: "right" }}>{t.colJson}</th>
                              <th style={{ textAlign: "right" }}>{t.colDecoded}</th>
                              <th style={{ textAlign: "right" }}>{t.colPct}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.topAssets.slice(0, 10).map((a) => {
                              const pct = report.totalBytes > 0 ? (a.jsonBytes / report.totalBytes) * 100 : 0;
                              return (
                                <tr key={a.id}>
                                  <td><code>{a.id}</code></td>
                                  <td>{a.mime || "—"}</td>
                                  <td style={{ textAlign: "right" }}>{fmtBytes(a.jsonBytes)}</td>
                                  <td style={{ textAlign: "right" }}>{fmtBytes(a.decodedBytes)}</td>
                                  <td style={{ textAlign: "right" }}>
                                    <span className="ins-pct-bar" style={{ ["--pct" as string]: `${Math.min(100, pct)}%` }}>
                                      {pct.toFixed(1)}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 16, textAlign: "center" }}>
                        <Link href="/compress" className="btn btn-primary">{t.topCta}</Link>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* JSON tree */}
              <div className="compress-panel" style={{ marginBottom: 60 }}>
                <div className="cpanel-section">
                  <div className="cpanel-title">{t.treeTitle}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{t.treeSub}</div>
                  <JsonTree data={json as Parameters<typeof JsonTree>[0]["data"]} lang={lang} />
                </div>
              </div>
            </>
          )}

          <div className="ad-row">
            <CarbonAd />
            <GoogleAd />
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            lottie-mini ·{" "}
            <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </div>
      </footer>
    </>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="ins-metric">
      <div className="ins-metric-label">{label}</div>
      <div className="ins-metric-value" style={accent ? { color: "var(--accent2)" } : undefined}>{value}</div>
    </div>
  );
}
