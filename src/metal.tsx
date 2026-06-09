import { useEffect, useState } from "react";

/**
 * The liquid-metal effect, pure CSS + SVG (no WebGL).
 *
 * A metallic surface is an animated multi-stop chrome gradient (light→dark→light
 * banding — the thing your eye reads as polished reflective metal) flowing under
 * a single global SVG displacement filter that ripples it like mercury. The
 * filter warps the surface's OWN gradient (SourceGraphic), so it's size- and
 * backdrop-independent — one filter serves every metal surface on the page.
 *
 * Two filter strengths are mounted once: a default ripple and a stronger one.
 * `feDisplacementMap` is feature-detected; where SVG filters are unavailable the
 * surface degrades to the (still good-looking) animated gradient alone.
 */

const RIPPLE_ID = "argent-ripple";
const FLOW_ID = "argent-flow";

let mounted = false;

function filter(id: string, scale: number, freq: string): string {
  return `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="7" result="n">
<animate attributeName="baseFrequency" dur="18s" values="${freq};${freq.split(" ").map((f) => (parseFloat(f) * 1.6).toFixed(4)).join(" ")};${freq}" repeatCount="indefinite"/>
</feTurbulence>
<feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>
</filter>`;
}

function ensureMetalFilters() {
  if (mounted || typeof document === "undefined") return;
  const wrap = document.createElement("div");
  wrap.setAttribute("aria-hidden", "true");
  wrap.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  wrap.innerHTML = `<svg><defs>${filter(RIPPLE_ID, 14, "0.006 0.013")}${filter(FLOW_ID, 26, "0.004 0.010")}</defs></svg>`;
  document.body.appendChild(wrap);
  mounted = true;
}

/** Mounts the global metal filters once (client-side) and reports readiness. */
export function useMetalFilters(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    ensureMetalFilters();
    setReady(true);
  }, []);
  return ready;
}

export const METAL_FILTERS = { ripple: RIPPLE_ID, flow: FLOW_ID } as const;
export type MetalLiquid = keyof typeof METAL_FILTERS | false;
