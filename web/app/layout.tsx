import type { Metadata } from "next";
import { LangProvider } from "../lib/LangContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "lottie-mini — Shrink Lottie files by 50–100×",
  description:
    "A desktop GUI tool that re-encodes embedded PNG frame sequences to WebP and rewrites the timeline — shrinking 70 MB Lottie files to under 1 MB.",
  openGraph: {
    title: "lottie-mini",
    description: "Shrink Lottie files by 50–100×, with a desktop GUI.",
    url: "https://lottie-mini.vercel.app",
    siteName: "lottie-mini",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
