import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.lottie-mini.com";
  return [
    { url: base,                                       lastModified: new Date(), changeFrequency: "weekly",  priority: 1   },
    { url: `${base}/preview`,                          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/inspect`,                          lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/guide`,                            lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/guide/why-lottie-files-are-big`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/guide/best-practices`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/guide/how-it-works`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
