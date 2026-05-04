import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://lottie-mini.vercel.app";
  return [
    { url: base,              lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/preview`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
}
