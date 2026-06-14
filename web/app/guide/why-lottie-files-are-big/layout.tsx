import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why your Lottie file is 70 MB — embedded PNG frame sequences explained",
  description:
    "A deep dive into why some Lottie animations are tens of megabytes despite being JSON files. Covers Bodymovin export behavior, base64-encoded PNG frames, dotLottie containers, and what compresses well vs what doesn't.",
  alternates: { canonical: "https://www.lottie-mini.com/guide/why-lottie-files-are-big" },
  openGraph: {
    type: "article",
    url: "https://www.lottie-mini.com/guide/why-lottie-files-are-big",
    title: "Why your Lottie file is 70 MB",
    description: "Embedded PNG frame sequences explained, with measurements and concrete fixes.",
  },
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
