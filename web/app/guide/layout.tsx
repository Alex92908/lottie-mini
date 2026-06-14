import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide — Lottie compression, file structure, best practices",
  description:
    "In-depth guides on Lottie file size, embedded PNG frame sequences, WebP re-encoding, frame skipping, and best practices for designers and developers shipping Lottie animations to production.",
  alternates: { canonical: "https://www.lottie-mini.com/guide" },
  openGraph: {
    type: "website",
    url: "https://www.lottie-mini.com/guide",
    title: "Guide — Lottie compression & best practices",
    description: "How Lottie files get huge and how to fix them, with detailed walkthroughs.",
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
