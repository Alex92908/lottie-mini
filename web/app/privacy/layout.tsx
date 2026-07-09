import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — lottie-mini",
  description:
    "lottie-mini processes all Lottie files 100% in your browser. Nothing is uploaded, no personally identifiable information is collected, and there is no user account system. This page explains exactly what data is and isn't handled.",
  alternates: { canonical: "https://lottie-mini.com/privacy" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
