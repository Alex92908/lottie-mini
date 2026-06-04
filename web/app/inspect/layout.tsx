import type { Metadata } from "next";

const URL_ = "https://www.lottie-mini.com/inspect";

export const metadata: Metadata = {
  title: "Lottie Inspector — Analyze JSON structure & find what makes files big",
  description:
    "Free online Lottie viewer and analyzer. Drop a .json or .lottie file to see file-size breakdown, the largest embedded raster assets, layer/shape counts, and a searchable, collapsible JSON tree. 100% local — no upload, no size limit.",
  keywords: [
    "lottie viewer", "lottie inspector", "lottie json viewer",
    "lottie analyzer", "lottie file size analysis",
    "lottie structure", "lottie debug", "dotlottie viewer",
  ],
  alternates: { canonical: URL_ },
  openGraph: {
    type: "website",
    url: URL_,
    title: "Lottie Inspector — analyze JSON structure, no upload",
    description:
      "See exactly why your Lottie file is large: file-size breakdown, top embedded assets, and a searchable JSON tree. Runs 100% in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lottie Inspector",
    description: "Analyze Lottie structure and find the bloat — 100% local.",
  },
};

export default function InspectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
