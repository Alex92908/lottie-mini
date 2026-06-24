import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lottie best practices for designers and developers",
  description:
    "Concrete rules of thumb for exporting Lottie from After Effects without size bloat, integrating animations on the web without performance regressions, and choosing between Lottie, MP4, and WebM in production.",
  alternates: { canonical: "https://lottie-mini.com/guide/best-practices" },
  openGraph: {
    type: "article",
    url: "https://lottie-mini.com/guide/best-practices",
    title: "Lottie best practices",
    description: "Production rules of thumb for designers, developers, and PMs.",
  },
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
