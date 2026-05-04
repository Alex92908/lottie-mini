"use client";
import { useEffect, useRef } from "react";

const SERVE = process.env.NEXT_PUBLIC_CARBON_SERVE ?? "";
const PLACEMENT = "lottieminivercelapp";

export function CarbonAd() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SERVE || !ref.current) return;
    // Remove stale ad on hot-reload / re-mount
    const old = ref.current.querySelector("#carbonads");
    if (old) old.remove();
    const s = document.createElement("script");
    s.id = "_carbonads_js";
    s.async = true;
    s.src = `//cdn.carbonads.com/carbon.js?serve=${SERVE}&placement=${PLACEMENT}`;
    ref.current.appendChild(s);
    return () => { s.remove(); };
  }, []);

  if (!SERVE) return null;
  return <div ref={ref} className="carbon-wrap" />;
}
