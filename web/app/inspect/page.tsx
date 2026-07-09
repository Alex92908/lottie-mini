"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "../../lib/LangContext";
import { parseDotLottie, repackDotLottie, isDotLottie } from "../../lib/dotlottie";
import { inspectLottie, fmtBytes } from "../../lib/inspect";
import { validateLottie } from "../../lib/lottie-validate";
import {
  commit, undo as undoOp, redo as redoOp, emptyHistory,
} from "../../lib/json-patch";
import type { JsonValue, Patch, History } from "../../lib/json-patch";
import { setHandoff } from "../../lib/handoff";
import JsonTree from "./JsonTree";
import { CarbonAd } from "../../components/CarbonAd";
import { Footer } from "../../components/Footer";

type State = "idle" | "loaded" | "error";

const T = {
  en: {
    title: "Lottie Inspector & Editor",
    sub: "Drop a .json or .lottie to see exactly what's inside — file-size breakdown, top embedded assets, and a fully editable JSON tree with undo/redo.",
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
    topSub: "These are inflating the file. Compress them and the size collapses.",
    colId: "Asset ID",
    colType: "Type",
    colJson: "Size in JSON",
    colDecoded: "Decoded",
    colPct: "% of file",
    topEmpty: "No embedded raster — this is a pure vector Lottie.",
    topCta: "Try the Compressor →",

    treeTitle: "JSON editor",
    treeSub: "Click any primitive value to edit. ＋ to add a child, ✕ to delete. Type-locked to prevent breakage.",
    undo: "↶ Undo", redo: "↷ Redo", revert: "↻ Revert", live: "Live",
    dlJson: "↓ Download JSON",
    dlDotLottie: "↓ Download .lottie",
    edited: "edited",
    issues: "Validation",
    issuesNone: "No issues found.",
    guide: "Guide",

    aboutH: "About the Lottie Inspector",
    aboutP1:
      "Lottie files are JSON documents that describe vector animations exported from After Effects. When designers use vector-only effects, the resulting file is typically a few kilobytes. But when an animation includes effects that can't be expressed as vectors — particle systems, fluid dynamics, image-based textures — the Bodymovin exporter embeds each frame as a base64-encoded PNG inside the JSON. A short 5-second animation at 30 fps can easily exceed 50 MB this way.",
    aboutP2:
      "The Inspector tells you exactly where the bytes go. It parses the JSON locally in your browser, separates the embedded raster bytes from the vector and structural data, and ranks the embedded image assets by size so you can spot the worst offenders. The editor lets you make changes directly — strip a redundant asset, lower the frame rate, fix a typo — with undo/redo and live validation against the basic Lottie schema.",

    howH: "How the analysis works",
    how1H: "Parse the file",
    how1B: "JSON files are parsed natively; .lottie containers are unzipped in-browser using fflate and the first animation entry is extracted. Nothing leaves your machine.",
    how2H: "Walk the asset table",
    how2B: "Every entry in the assets array is inspected. Assets whose p field is a data: URL are treated as embedded raster; their base64 length contributes directly to the file's total bytes.",
    how3H: "Sum and rank",
    how3B: "Vector vs raster percentages are computed from byte counts, not asset counts. The asset table sorts by raw JSON footprint, which is what actually drives file size — a smaller decoded image with longer base64 padding can outweigh a visually larger one.",

    safetyH: "Editing safely",
    safetyP:
      "Every value edit is type-locked: a number stays a number, a string stays a string. This prevents the most common way to break a Lottie file with a careless edit. The validator checks structural sanity — required fields fr, w, h, ip, op are present and numeric; the frame range is valid; layer refId references still match an existing asset id — and flags problems inline so you can fix them before downloading.",
  },
  zh: {
    title: "Lottie 分析与编辑器",
    sub: "拖入 .json 或 .lottie,看清结构、定位大资源,并直接在浏览器里编辑 JSON,带撤销/重做,完全本地。",
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
    topEmpty: "没有内嵌位图——这是纯矢量 Lottie。",
    topCta: "去压缩工具 →",

    treeTitle: "JSON 编辑器",
    treeSub: "点击任意基础值即可编辑;＋ 添加子节点,✕ 删除。类型锁定,避免破坏文件。",
    undo: "↶ 撤销", redo: "↷ 重做", revert: "↻ 还原原始", live: "实时",
    dlJson: "↓ 下载 JSON",
    dlDotLottie: "↓ 下载 .lottie",
    edited: "已修改",
    issues: "校验",
    issuesNone: "未发现问题。",
    guide: "使用指南",

    aboutH: "关于 Lottie 分析工具",
    aboutP1:
      "Lottie 文件本质是描述矢量动画的 JSON 文档,从 After Effects 通过 Bodymovin 插件导出。纯矢量动画通常只有几 KB。但只要动画里用到了无法用矢量表达的效果——粒子、流体、位图纹理——Bodymovin 会把每一帧 PNG 用 base64 编码内嵌进 JSON。一个 5 秒 30fps 的动画就能轻松超过 50 MB。",
    aboutP2:
      "Inspector 告诉你每个字节去哪儿了。它在你的浏览器本地解析 JSON,把内嵌位图字节和矢量、结构数据分开统计,并按体积对内嵌图片资源排序,让最糟糕的元凶一眼可见。编辑器允许你直接修改——删掉一个多余资源、降低帧率、修正一个拼写错误——支持撤销/重做和基本 Lottie schema 校验。",

    howH: "分析原理",
    how1H: "解析文件",
    how1B: "`.json` 文件直接 JSON 解析;`.lottie` 容器用 fflate 在浏览器里解压,提取第一个动画条目。不发送到任何服务器。",
    how2H: "遍历资源表",
    how2B: "扫描 assets 数组的每一项。`p` 字段是 `data:` URL 的视为内嵌位图,base64 字符串长度直接计入文件总字节。",
    how3H: "汇总与排序",
    how3B: "矢量 vs 位图百分比按字节数计算,而非资源个数。资源表按 JSON 原始占用排序,因为这才是真正决定文件大小的——一个解码后较小但 base64 padding 较长的图,可能比视觉上更大的图占用更多 JSON 字节。",

    safetyH: "安全编辑",
    safetyP:
      "每一次值修改都是类型锁定的:数字保持是数字,字符串保持是字符串。这避免了手抖改坏 Lottie 最常见的方式。校验器检查结构完整性——必需字段 `fr`、`w`、`h`、`ip`、`op` 是否存在且为数字;帧范围是否有效;图层 refId 引用是否仍指向存在的资源 id——并把问题内联标出,让你下载前修好。",
  },
} as const;

export default function InspectPage() {
  const { lang, toggle } = useLang();
  const t = T[lang];
  const router = useRouter();

  const [state, setState] = useState<State>("idle");
  const [dragging, setDragging] = useState(false);

  // Source state — the file we loaded
  const [originalJson, setOriginalJson] = useState<Record<string, unknown> | null>(null);
  const [originalBuf, setOriginalBuf] = useState<ArrayBuffer | null>(null); // only set for .lottie
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  // Editable state — the working copy + undo stack
  const [json, setJson] = useState<JsonValue | null>(null);
  const [history, setHistory] = useState<History>(emptyHistory());

  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (file: File) => {
    setError(""); setOriginalJson(null); setJson(null); setHistory(emptyHistory());
    setOriginalBuf(null);
    try {
      let parsed: Record<string, unknown>;
      if (isDotLottie(file)) {
        const buf = await file.arrayBuffer();
        parsed = await parseDotLottie(buf);
        setOriginalBuf(buf);
      } else {
        const text = await file.text();
        parsed = JSON.parse(text);
      }
      setOriginalJson(parsed);
      setJson(parsed as JsonValue);
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

  const resetAll = () => {
    setState("idle");
    setOriginalJson(null); setJson(null); setHistory(emptyHistory());
    setFileName(""); setOriginalBuf(null); setError("");
  };

  // ---- editing ----

  const onPatch = useCallback((patch: Patch) => {
    setJson((prev) => {
      if (prev === null) return prev;
      const result = commit(prev, patch, history);
      setHistory(result.hist);
      return result.root;
    });
  }, [history]);

  const onUndo = useCallback(() => {
    if (json === null) return;
    const r = undoOp(json, history);
    if (r) { setJson(r.root); setHistory(r.hist); }
  }, [json, history]);

  const onRedo = useCallback(() => {
    if (json === null) return;
    const r = redoOp(json, history);
    if (r) { setJson(r.root); setHistory(r.hist); }
  }, [json, history]);

  const revertOriginal = () => {
    if (!originalJson) return;
    setJson(originalJson as JsonValue);
    setHistory(emptyHistory());
  };

  // ---- live derived state ----

  // Re-serialize on every edit to compute current size + report. For very
  // large files this is OK because JSON.stringify is fast and the user
  // typically pauses between edits.
  const derived = useMemo(() => {
    if (json === null) return null;
    const serialized = JSON.stringify(json);
    const report = inspectLottie(json as Record<string, unknown>, serialized.length);
    const issues = validateLottie(json as Record<string, unknown>);
    return { serialized, report, issues };
  }, [json]);

  const isEdited = history.past.length > 0;

  // ---- downloads ----

  const dlJson = () => {
    if (!derived) return;
    const blob = new Blob([derived.serialized], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName.replace(/\.lottie$/i, ".json").replace(/\.json$/i, "") + "_edited.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const dlDotLottie = () => {
    if (!originalBuf || json === null) return;
    const packed = repackDotLottie(originalBuf, json as Record<string, unknown>);
    const blob = new Blob([packed as BlobPart], { type: "application/zip" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName.replace(/\.lottie$/i, "") + "_edited.lottie";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link href="/" style={{ display: "block" }}>
            <img src="/logo-text.svg" alt="lottie-mini" height={36} style={{ display: "block" }} />
          </Link>
          <div className="nav-links">
            <Link href="/guide">{t.guide}</Link>
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
            <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 600, margin: "0 auto" }}>{t.sub}</p>
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
                ref={inputRef} type="file" accept=".json,.lottie"
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
              <button className="ctrl-btn" style={{ marginLeft: 16 }} onClick={resetAll}>↩</button>
            </div>
          )}

          {state === "loaded" && derived && json !== null && (
            <>
              {/* Overview */}
              <div className="compress-panel" style={{ marginBottom: 32 }}>
                <div className="cpanel-section">
                  <div className="cpanel-title">
                    {t.overviewLabel} ·{" "}
                    <span style={{ textTransform: "none", color: "var(--text)", fontWeight: 600 }}>{fileName}</span>
                    {isEdited && <span className="ins-edited-badge">{t.edited}</span>}
                    <button className="ctrl-btn" style={{ float: "right", marginTop: -4 }} onClick={resetAll}>{t.reset}</button>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                      {t.breakdown} · {fmtBytes(derived.report.totalBytes)} <span style={{ color: "var(--accent2)" }}>· {t.live}</span>
                    </div>
                    <div className="ins-stack">
                      <div className="ins-stack-vec" style={{ width: `${100 - derived.report.embeddedPct}%` }}
                        title={`${t.breakdownVector}: ${fmtBytes(derived.report.vectorBytes)}`} />
                      <div className="ins-stack-raster" style={{ width: `${derived.report.embeddedPct}%` }}
                        title={`${t.breakdownEmbedded}: ${fmtBytes(derived.report.embeddedBytes)}`} />
                    </div>
                    <div className="ins-legend">
                      <span><i className="ins-dot ins-dot-vec" /> {t.breakdownVector} · {fmtBytes(derived.report.vectorBytes)} ({(100 - derived.report.embeddedPct).toFixed(1)}%)</span>
                      <span><i className="ins-dot ins-dot-raster" /> {t.breakdownEmbedded} · {fmtBytes(derived.report.embeddedBytes)} ({derived.report.embeddedPct.toFixed(1)}%)</span>
                    </div>
                  </div>

                  <div className="ins-meta-grid">
                    <Metric label={t.metaVersion} value={derived.report.version} />
                    <Metric label={t.metaCanvas} value={`${derived.report.width} × ${derived.report.height}`} />
                    <Metric label={t.metaFps} value={String(derived.report.fps)} />
                    <Metric label={t.metaDuration} value={`${derived.report.durationFrames} ${t.metaFrames} · ${derived.report.durationSec}${t.metaSec}`} />
                    <Metric label={t.metaComps} value={String(derived.report.compositionCount)} />
                    <Metric label={t.metaLayers} value={String(derived.report.layerCount)} />
                    <Metric label={t.metaShapes} value={String(derived.report.shapeCount)} />
                    <Metric label={t.metaEmbedded} value={String(derived.report.embeddedCount)} accent={derived.report.embeddedCount > 0} />
                  </div>
                </div>

                {/* Validation */}
                {derived.issues.length > 0 && (
                  <div className="cpanel-section">
                    <div className="cpanel-title">{t.issues}</div>
                    <ul className="ins-issues">
                      {derived.issues.map((iss, i) => (
                        <li key={i} className={iss.severity === "error" ? "ins-issue-error" : "ins-issue-warn"}>
                          <strong>{iss.severity === "error" ? "✗" : "⚠"}</strong> {iss.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Top assets */}
              <div className="compress-panel" style={{ marginBottom: 32 }}>
                <div className="cpanel-section">
                  <div className="cpanel-title">{t.topTitle}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{t.topSub}</div>

                  {derived.report.topAssets.length === 0 ? (
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
                            {derived.report.topAssets.slice(0, 10).map((a) => {
                              const pct = derived.report.totalBytes > 0 ? (a.jsonBytes / derived.report.totalBytes) * 100 : 0;
                              return (
                                <tr key={a.id}>
                                  <td><code>{a.id}</code></td>
                                  <td>{a.mime || "—"}</td>
                                  <td style={{ textAlign: "right" }}>{fmtBytes(a.jsonBytes)}</td>
                                  <td style={{ textAlign: "right" }}>{fmtBytes(a.decodedBytes)}</td>
                                  <td style={{ textAlign: "right" }}>
                                    <span className="ins-pct-bar">{pct.toFixed(1)}%</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 16, textAlign: "center" }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            setHandoff({
                              json: json as Record<string, unknown>,
                              fileName,
                              size: derived.serialized.length,
                            });
                            router.push("/compress");
                          }}
                        >
                          {t.topCta}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* JSON editor */}
              <div className="compress-panel" style={{ marginBottom: 60 }}>
                <div className="cpanel-section">
                  <div className="cpanel-title">{t.treeTitle}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{t.treeSub}</div>

                  {/* Editor toolbar */}
                  <div className="jt-edit-toolbar">
                    <button className="ctrl-btn" onClick={onUndo} disabled={history.past.length === 0}>{t.undo}</button>
                    <button className="ctrl-btn" onClick={onRedo} disabled={history.future.length === 0}>{t.redo}</button>
                    <button className="ctrl-btn" onClick={revertOriginal} disabled={!isEdited}>{t.revert}</button>
                    <span style={{ flex: 1 }} />
                    <button className="ctrl-btn" onClick={dlJson}>{t.dlJson}</button>
                    {originalBuf && (
                      <button className="ctrl-btn" onClick={dlDotLottie}>{t.dlDotLottie}</button>
                    )}
                  </div>

                  <JsonTree data={json} lang={lang} onPatch={onPatch} />
                </div>
              </div>
            </>
          )}

          <article className="page-prose">
            <h2>{t.aboutH}</h2>
            <p>{t.aboutP1}</p>
            <p>{t.aboutP2}</p>

            <h2>{t.howH}</h2>
            <ol>
              <li><strong>{t.how1H}.</strong> {t.how1B}</li>
              <li><strong>{t.how2H}.</strong> {t.how2B}</li>
              <li><strong>{t.how3H}.</strong> {t.how3B}</li>
            </ol>

            <h2>{t.safetyH}</h2>
            <p>{t.safetyP}</p>
          </article>

          <div className="ad-row">
            <CarbonAd />
          </div>
        </div>
      </main>

      <Footer />
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
