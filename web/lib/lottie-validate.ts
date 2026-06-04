// Lightweight Lottie sanity checker.
//
// NOT a schema validator — Lottie's official schema is enormous and many
// real-world files don't strictly conform. We only flag mistakes that
// commonly break players after manual editing:
//
//   - Required playback fields removed (fr / w / h / ip / op)
//   - Required fields no longer numeric
//   - Layers that reference an asset id that no longer exists
//   - Negative or invalid frame ranges

export interface ValidationIssue {
  severity: "error" | "warn";
  message: string;
}

interface AnyObj { [k: string]: unknown }

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function validateLottie(json: Record<string, unknown>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const k of ["fr", "w", "h", "ip", "op"] as const) {
    if (!(k in json)) {
      issues.push({ severity: "error", message: `Missing required field "${k}".` });
    } else if (!isNum(json[k])) {
      issues.push({ severity: "error", message: `Field "${k}" must be a number.` });
    }
  }

  if (isNum(json.ip) && isNum(json.op) && json.op <= json.ip) {
    issues.push({ severity: "warn", message: `Invalid frame range: op (${json.op}) ≤ ip (${json.ip}).` });
  }
  if (isNum(json.fr) && json.fr <= 0) {
    issues.push({ severity: "warn", message: `Frame rate "fr" should be > 0.` });
  }

  // Asset reference integrity: every layer with refId must point to an existing asset id.
  const assets = Array.isArray(json.assets) ? (json.assets as AnyObj[]) : [];
  const assetIds = new Set(assets.map((a) => String(a.id)));

  function walkLayers(layers: unknown[], where: string): void {
    for (const raw of layers) {
      const layer = raw as AnyObj;
      const refId = layer.refId;
      if (typeof refId === "string" && !assetIds.has(refId)) {
        issues.push({
          severity: "error",
          message: `Layer "${String(layer.nm ?? "?")}" in ${where} references missing asset id "${refId}".`,
        });
      }
      if (Array.isArray(layer.layers)) walkLayers(layer.layers as unknown[], `${where} → ${String(layer.nm ?? "?")}`);
    }
  }

  if (Array.isArray(json.layers)) walkLayers(json.layers as unknown[], "root");
  for (const a of assets) {
    if (Array.isArray(a.layers)) walkLayers(a.layers as unknown[], `asset ${String(a.id)}`);
  }

  return issues;
}
