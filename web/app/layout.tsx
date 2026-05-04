import type { Metadata } from "next";
import Script from "next/script";
import { LangProvider } from "../lib/LangContext";
import "./globals.css";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
const BASE = "https://lottie-mini.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "lottie-mini — Compress Lottie files by 50–100×",
    template: "%s | lottie-mini",
  },
  description:
    "Free online Lottie compressor. Re-encodes embedded PNG frames to WebP, skips frames, and rewrites the timeline — shrinking 70 MB Lottie files to under 1 MB. Runs 100% in your browser, no upload.",
  keywords: [
    "lottie compress", "lottie optimizer", "reduce lottie file size",
    "lottie webp", "compress lottie json", "lottie file size reducer",
    "lottie preview", "lottie tools", "lottie-mini",
  ],
  authors: [{ name: "Alex92908", url: "https://github.com/Alex92908" }],
  creator: "Alex92908",
  openGraph: {
    type: "website",
    url: BASE,
    siteName: "lottie-mini",
    title: "lottie-mini — Compress Lottie files by 50–100×",
    description:
      "Free browser-based Lottie compressor. No upload, no size limit. Shrink 70 MB files to under 1 MB.",
    images: [{ url: "/screenshot_en.png", width: 1280, height: 800, alt: "lottie-mini screenshot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "lottie-mini — Compress Lottie files by 50–100×",
    description: "Free browser-based Lottie compressor. No upload, no size limit.",
    images: ["/screenshot_en.png"],
  },
  alternates: {
    canonical: BASE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "lottie-mini",
  url: BASE,
  description: "Free browser-based Lottie file compressor. Re-encodes PNG frames to WebP and rewrites the animation timeline.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "Alex92908", url: "https://github.com/Alex92908" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LangProvider>{children}</LangProvider>
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
