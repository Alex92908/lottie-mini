import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";

export async function parseDotLottie(buf: ArrayBuffer): Promise<Record<string, unknown>> {
  const zip = unzipSync(new Uint8Array(buf));

  // Find first animation JSON inside animations/
  const animKey = Object.keys(zip).find(
    (k) => k.startsWith("animations/") && k.endsWith(".json")
  );
  if (!animKey) throw new Error("No animation found in .lottie file");

  return JSON.parse(strFromU8(zip[animKey]));
}

/**
 * Re-pack a dotLottie file with a modified animation JSON.
 * Preserves manifest, images, and any sibling files; only the first
 * animations/*.json entry is overwritten.
 */
export function repackDotLottie(
  originalBuf: ArrayBuffer,
  newAnimation: Record<string, unknown>,
): Uint8Array {
  const zip = unzipSync(new Uint8Array(originalBuf));
  const animKey = Object.keys(zip).find(
    (k) => k.startsWith("animations/") && k.endsWith(".json")
  );
  if (!animKey) throw new Error("Original .lottie has no animation entry");
  zip[animKey] = strToU8(JSON.stringify(newAnimation));
  return zipSync(zip);
}

export function isDotLottie(file: File) {
  return file.name.endsWith(".lottie");
}
