// Lottie file structural analysis.
//
// Given the parsed JSON and the original file size, produce a compact summary
// that answers "why is this file so big" in one glance:
//   - how much of the file is vector data vs embedded raster
//   - which individual embedded assets dominate the size
//   - basic playback metadata (fps, duration, layers)

export interface AssetEntry {
  /** Asset id from the Lottie JSON (e.g. "image_0"). */
  id: string;
  /** Bytes that this asset occupies inside the JSON (the base64 string length). */
  jsonBytes: number;
  /** Approximate decoded size of the embedded image (if decodable). */
  decodedBytes: number;
  /** MIME type, e.g. "image/png", "image/webp", or "" if unknown. */
  mime: string;
  /** First ~60 chars of the data URL header, useful for the UI tooltip. */
  preview: string;
}

export interface InspectReport {
  // ---- file shape ----
  /** Raw on-disk file size in bytes (the source the user dropped in). */
  totalBytes: number;
  /** Total bytes occupied by embedded base64 strings in the JSON. */
  embeddedBytes: number;
  /** totalBytes - embeddedBytes (rough proxy for vector + structural overhead). */
  vectorBytes: number;
  /** Percentage 0–100 of file taken by embedded raster. */
  embeddedPct: number;

  // ---- counts ----
  embeddedCount: number;
  compositionCount: number;
  layerCount: number;
  shapeCount: number;

  // ---- playback ----
  version: string;
  width: number;
  height: number;
  fps: number;
  /** Total frames (op - ip). */
  durationFrames: number;
  durationSec: number;

  /** Largest assets first. */
  topAssets: AssetEntry[];
}

interface Asset {
  id?: string;
  p?: string;
  e?: number;
  layers?: unknown[];
}

interface Layer {
  ty?: number;
  shapes?: unknown[];
  layers?: unknown[];
}

function isImageAsset(a: Asset): boolean {
  return typeof a.p === "string" && a.p.startsWith("data:image");
}

function mimeOf(dataUrl: string): string {
  // "data:image/png;base64,iVBOR..." → "image/png"
  const i = dataUrl.indexOf(";");
  if (i < 0) return "";
  return dataUrl.slice(5, i);
}

/** base64 string length → approximate decoded byte count. */
function decodedSizeFromBase64(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return 0;
  const b64 = dataUrl.slice(comma + 1);
  // Each 4 base64 chars encode 3 bytes; trailing "=" subtracts.
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

function countLayers(layers: unknown[]): { layers: number; shapes: number; comps: number } {
  let l = 0, s = 0, c = 0;
  for (const raw of layers) {
    const layer = raw as Layer;
    l += 1;
    if (Array.isArray(layer.shapes)) s += layer.shapes.length;
    if (Array.isArray(layer.layers)) {
      c += 1;
      const sub = countLayers(layer.layers);
      l += sub.layers; s += sub.shapes; c += sub.comps;
    }
  }
  return { layers: l, shapes: s, comps: c };
}

export function inspectLottie(
  json: Record<string, unknown>,
  totalBytes: number,
): InspectReport {
  const assets = (json.assets as Asset[]) ?? [];
  const rootLayers = (json.layers as unknown[]) ?? [];

  // Embedded assets (image data URLs) + precomp-style nested compositions
  const imgAssets = assets.filter(isImageAsset);
  const precompAssets = assets.filter(
    (a) => Array.isArray(a.layers) && !isImageAsset(a),
  );

  const topAssets: AssetEntry[] = imgAssets.map((a) => {
    const p = a.p as string;
    return {
      id: String(a.id ?? ""),
      jsonBytes: p.length,
      decodedBytes: decodedSizeFromBase64(p),
      mime: mimeOf(p),
      preview: p.slice(0, 64),
    };
  }).sort((x, y) => y.jsonBytes - x.jsonBytes);

  const embeddedBytes = topAssets.reduce((sum, a) => sum + a.jsonBytes, 0);
  // Clamp: if totalBytes < embeddedBytes (shouldn't happen) treat vector as 0.
  const vectorBytes = Math.max(0, totalBytes - embeddedBytes);
  const embeddedPct = totalBytes > 0
    ? Math.round((embeddedBytes / totalBytes) * 1000) / 10
    : 0;

  // Layer/shape counts across root + every precomp.
  const rootCounts = countLayers(rootLayers);
  let layers = rootCounts.layers;
  let shapes = rootCounts.shapes;
  let comps = 1 + rootCounts.comps; // root composition + nested precomps
  for (const pre of precompAssets) {
    const sub = countLayers(pre.layers as unknown[]);
    layers += sub.layers;
    shapes += sub.shapes;
    comps += sub.comps;
  }

  const fps = (json.fr as number) ?? 0;
  const ip = (json.ip as number) ?? 0;
  const op = (json.op as number) ?? 0;
  const durationFrames = Math.max(0, op - ip);
  const durationSec = fps > 0 ? +(durationFrames / fps).toFixed(2) : 0;

  return {
    totalBytes,
    embeddedBytes,
    vectorBytes,
    embeddedPct,
    embeddedCount: imgAssets.length,
    compositionCount: comps,
    layerCount: layers,
    shapeCount: shapes,
    version: (json.v as string) ?? "?",
    width: (json.w as number) ?? 0,
    height: (json.h as number) ?? 0,
    fps,
    durationFrames,
    durationSec,
    topAssets,
  };
}

export function fmtBytes(n: number): string {
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(2) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
  return n + " B";
}
