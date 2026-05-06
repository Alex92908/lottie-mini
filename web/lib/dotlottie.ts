import { unzipSync, strFromU8 } from "fflate";

export async function parseDotLottie(buf: ArrayBuffer): Promise<Record<string, unknown>> {
  const zip = unzipSync(new Uint8Array(buf));

  // Find first animation JSON inside animations/
  const animKey = Object.keys(zip).find(
    (k) => k.startsWith("animations/") && k.endsWith(".json")
  );
  if (!animKey) throw new Error("No animation found in .lottie file");

  return JSON.parse(strFromU8(zip[animKey]));
}

export function isDotLottie(file: File) {
  return file.name.endsWith(".lottie");
}
