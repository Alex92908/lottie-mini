import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How the lottie-mini compressor works — in-browser PNG to WebP pipeline",
  description:
    "Technical walkthrough of the lottie-mini compression pipeline: PNG decoding in a Web Worker, WebP encoding via libwebp.js WebAssembly, frame stride dropping, and timeline rewrite. 100% client-side, no upload.",
  alternates: { canonical: "https://lottie-mini.com/guide/how-it-works" },
  openGraph: {
    type: "article",
    url: "https://lottie-mini.com/guide/how-it-works",
    title: "How the lottie-mini compressor works",
    description: "PNG decoding, WebP encoding via WebAssembly, frame stride, and timeline rewrite.",
  },
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
