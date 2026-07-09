import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — the story behind lottie-mini",
  description:
    "lottie-mini is an open-source Lottie compression toolkit built by Alex Chu, a software engineer working on browser-based creative tooling. Learn about the project's origins, philosophy, and roadmap.",
  alternates: { canonical: "https://lottie-mini.com/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
