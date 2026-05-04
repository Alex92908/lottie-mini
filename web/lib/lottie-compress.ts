export interface CompressOptions {
  quality: number;        // 1–100
  stride: number;         // 1 2 3 4
  targetWidth?: number;
  lossless: boolean;
  outputFormat: "webp" | "png";
}

export interface Progress {
  pct: number;
  msg: string;
}

type LottieJson = Record<string, unknown>;
type Asset = Record<string, unknown>;

function isImageAsset(a: Asset): boolean {
  return typeof a.p === "string" && (a.p as string).startsWith("data:");
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function canvasToB64(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number
): Promise<string> {
  return new Promise((res) => {
    canvas.toBlob(
      (blob) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          res((e.target!.result as string).split(",")[1]);
        reader.readAsDataURL(blob!);
      },
      mime,
      quality
    );
  });
}

function encodeFrame(
  img: HTMLImageElement,
  w: number,
  h: number,
  opts: CompressOptions
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  const mime = opts.outputFormat === "png" ? "image/png" : "image/webp";
  const q = opts.lossless || opts.outputFormat === "png"
    ? undefined
    : opts.quality / 100;
  return canvasToB64(canvas, mime, q);
}

function yield_(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

export async function compressLottie(
  json: LottieJson,
  opts: CompressOptions,
  onProgress: (p: Progress) => void
): Promise<LottieJson> {
  const assets = (json.assets as Asset[]) ?? [];
  const imgAssets = assets.filter(isImageAsset);
  if (imgAssets.length === 0)
    throw new Error("No embedded image frames found in this Lottie file.");

  onProgress({ pct: 2, msg: `Found ${imgAssets.length} image frames` });

  // Dimensions from first frame
  const firstImg = await loadImg(imgAssets[0].p as string);
  const origW = firstImg.width;
  const origH = firstImg.height;
  let targetW = origW;
  let targetH = origH;
  if (opts.targetWidth && opts.targetWidth > 0 && opts.targetWidth < origW) {
    targetW = opts.targetWidth;
    targetH = Math.round(origH * (targetW / origW));
  }

  const keptIndices: number[] = [];
  for (let i = 0; i < imgAssets.length; i += opts.stride) keptIndices.push(i);
  if (opts.stride > 1)
    onProgress({ pct: 4, msg: `Keeping ${keptIndices.length}/${imgAssets.length} frames` });

  // Encode frames
  const encodedB64s: string[] = [];
  for (let ni = 0; ni < keptIndices.length; ni++) {
    const img = ni === 0 && opts.stride === 1
      ? firstImg
      : await loadImg(imgAssets[keptIndices[ni]].p as string);
    encodedB64s.push(await encodeFrame(img, targetW, targetH, opts));
    onProgress({
      pct: 5 + Math.round((ni / keptIndices.length) * 85),
      msg: `Encoding ${ni + 1} / ${keptIndices.length}`,
    });
    if (ni % 5 === 0) await yield_();
  }

  onProgress({ pct: 92, msg: "Rebuilding Lottie JSON…" });

  // Build new image assets
  const mime = `image/${opts.outputFormat}`;
  const newImgAssets: Asset[] = keptIndices.map((origI, ni) => ({
    ...(imgAssets[origI] as object),
    p: `data:${mime};base64,${encodedB64s[ni]}`,
    w: targetW,
    h: targetH,
  }));

  const d: LottieJson = JSON.parse(JSON.stringify(json));
  const seqAsset = assets.find(
    (a) => !isImageAsset(a) && Array.isArray((a as Asset).layers)
  ) as Asset | undefined;

  if (seqAsset) {
    const origTotal = imgAssets.length;
    const newTotal = keptIndices.length;
    const seqLayers = (seqAsset.layers as Asset[]);

    const newSeqLayers: Asset[] =
      opts.stride > 1
        ? keptIndices.map((origI, ni) => {
            const src = seqLayers[origI] ?? seqLayers[0];
            const l: Asset = JSON.parse(JSON.stringify(src));
            const sf = origTotal / newTotal;
            l.ip = Math.round(ni * sf);
            l.op = Math.round((ni + 1) * sf);
            l.st = l.ip;
            l.refId = newImgAssets[ni].id;
            return l;
          })
        : seqLayers.map((l, i) => {
            const copy: Asset = JSON.parse(JSON.stringify(l));
            if (i < newImgAssets.length) copy.refId = newImgAssets[i].id;
            return copy;
          });

    const nonImg = (d.assets as Asset[]).filter(
      (a) => !isImageAsset(a) && (a as Asset).id !== seqAsset.id
    );
    const updatedSeq: Asset = {
      ...JSON.parse(JSON.stringify(seqAsset)),
      layers: newSeqLayers,
    };
    d.assets = [...newImgAssets, updatedSeq, ...nonImg];
  } else {
    const nonImg = (d.assets as Asset[]).filter((a) => !isImageAsset(a));
    d.assets = [...newImgAssets, ...nonImg];
  }

  if (targetW !== origW || targetH !== origH) {
    if (d.w === origW) d.w = targetW;
    if (d.h === origH) d.h = targetH;
    for (const l of (d.layers as Asset[]) ?? []) {
      if (l.w === origW) l.w = targetW;
      if (l.h === origH) l.h = targetH;
    }
  }

  onProgress({ pct: 100, msg: "Done" });
  return d;
}

export function analyzeJson(json: LottieJson) {
  const assets = (json.assets as Asset[]) ?? [];
  const imgAssets = assets.filter(isImageAsset);
  let format = "";
  if (imgAssets.length > 0) {
    const header = (imgAssets[0].p as string).split(",")[0];
    format = header.split(";")[0].split(":")[1] ?? "";
  }
  return {
    imageCount: imgAssets.length,
    version: (json.v as string) ?? "?",
    w: (json.w as number) ?? 0,
    h: (json.h as number) ?? 0,
    fr: (json.fr as number) ?? 0,
    op: (json.op as number) ?? 0,
    format,
  };
}
