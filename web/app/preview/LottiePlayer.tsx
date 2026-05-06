"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { parseDotLottie, isDotLottie } from "../../lib/dotlottie";

interface FileState {
  name: string;
  sizeMB: string;
  frames: number;
  fps: number;
  w: number;
  h: number;
}

function formatMB(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2);
}

function parseInfo(json: Record<string, unknown>): Omit<FileState, "name" | "sizeMB"> {
  const assets = (json.assets as unknown[]) ?? [];
  const frames = assets.filter(
    (a) =>
      typeof (a as Record<string, unknown>).p === "string" &&
      ((a as Record<string, unknown>).p as string).startsWith("data:")
  ).length;
  return {
    frames,
    fps: (json.fr as number) ?? 0,
    w: (json.w as number) ?? 0,
    h: (json.h as number) ?? 0,
  };
}

function Player({ label, lang }: { label: string; lang: "en" | "zh" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [info, setInfo] = useState<FileState | null>(null);
  // pendingJson is set first; useEffect fires after DOM update and starts animation
  const [pendingJson, setPendingJson] = useState<unknown>(null);
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [error, setError] = useState("");

  // Start animation after the canvas div is in the DOM
  useEffect(() => {
    if (!pendingJson || !containerRef.current) return;
    if (animRef.current) { animRef.current.destroy(); animRef.current = null; }
    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "canvas",
      loop: true,
      autoplay: true,
      animationData: pendingJson as object,
      rendererSettings: {
        clearCanvas: true,
        preserveAspectRatio: "xMidYMid meet",
      },
    });
    setPlaying(true);
    setPendingJson(null);
  }, [pendingJson, info]); // info dep ensures the div exists before we fire

  const load = useCallback((file: File) => {
    setError("");
    const finish = (json: Record<string, unknown>) => {
      setInfo({ name: file.name, sizeMB: formatMB(file.size), ...parseInfo(json) });
      setPendingJson(json);
    };
    const fail = () => setError(
      lang === "en" ? "Invalid file — expected Lottie JSON or .lottie" : "文件解析失败，请确认是 Lottie JSON 或 .lottie 文件"
    );
    if (isDotLottie(file)) {
      file.arrayBuffer().then((buf) => parseDotLottie(buf).then(finish).catch(fail)).catch(fail);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try { finish(JSON.parse(e.target?.result as string)); } catch { fail(); }
      };
      reader.readAsText(file);
    }
  }, [lang]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) load(file);
    },
    [load]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) load(file);
    },
    [load]
  );

  const togglePlay = () => {
    if (!animRef.current) return;
    if (playing) {
      animRef.current.pause();
      setPlaying(false);
    } else {
      animRef.current.play();
      setPlaying(true);
    }
  };

  useEffect(() => () => { animRef.current?.destroy(); }, []);

  const ph =
    lang === "en"
      ? { drop: "Drop Lottie JSON or .lottie here", or: "or click to browse", hint: "No size limit · JSON & dotLottie · 100% local" }
      : { drop: "拖入 Lottie JSON 或 .lottie 文件", or: "或点击选择文件", hint: "无大小限制 · 支持 JSON 和 dotLottie · 完全本地" };

  return (
    <div className="player-card">
      <div className="player-label">{label}</div>

      {/* Drop zone */}
      <div
        className={`drop-zone${dragging ? " dragging" : ""}${info ? " has-file" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !info && document.getElementById(`file-${label}`)?.click()}
      >
        <input
          id={`file-${label}`}
          type="file"
          accept=".json,.lottie"
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        {!info ? (
          <div className="drop-placeholder">
            <div className="drop-icon">🎬</div>
            <div className="drop-text">{ph.drop}</div>
            <div className="drop-sub">{ph.or}</div>
            <div className="drop-hint">{ph.hint}</div>
          </div>
        ) : (
          <div ref={containerRef} className="lottie-canvas" />
        )}
      </div>

      {error && <div className="player-error">{error}</div>}

      {/* Info bar */}
      {info && (
        <div className="player-info">
          <div className="info-row">
            <span className="info-name" title={info.name}>{info.name}</span>
            <span className="info-size">{info.sizeMB} MB</span>
          </div>
          <div className="info-meta">
            {info.w}×{info.h} · {info.fps} fps ·{" "}
            {info.frames} {lang === "en" ? "img frames" : "图片帧"}
          </div>
          <div className="info-actions">
            <button className="ctrl-btn" onClick={togglePlay}>
              {playing
                ? `⏸ ${lang === "en" ? "Pause" : "暂停"}`
                : `▶ ${lang === "en" ? "Play" : "播放"}`}
            </button>
            <label className="ctrl-btn" style={{ cursor: "pointer" }}>
              📂 {lang === "en" ? "Load another" : "重新加载"}
              <input type="file" accept=".json,.lottie" style={{ display: "none" }} onChange={onFileChange} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LottiePreview({ lang }: { lang: "en" | "zh" }) {
  const labels =
    lang === "en"
      ? ["Before (original)", "After (compressed)"]
      : ["压缩前（原始）", "压缩后（结果）"];

  return (
    <div className="preview-grid">
      <Player label={labels[0]} lang={lang} />
      <Player label={labels[1]} lang={lang} />
    </div>
  );
}
