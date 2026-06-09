import { useEffect, useRef, useState } from "react";
import { LiquidMetal, type LiquidMetalParams } from "@paper-design/shaders-react";

/**
 * The liquid-metal surface is Paper's `LiquidMetal` WebGL shader
 * (@paper-design/shaders) run with `shape="none"` so it fills the whole element
 * instead of painting a blob. Each tone is a tuned set of shader params; the
 * canvas sits behind the content and is clipped to the surface's radius.
 *
 * `@paper-design/shaders-react` is a peer dependency — install it alongside
 * `argentui`. It is licensed under PolyForm Shield by Paper.
 */

export type MetalTone = "silver" | "gold" | "gunmetal" | "obsidian";

type Tuned = Pick<
  LiquidMetalParams,
  "colorBack" | "colorTint" | "repetition" | "softness" | "shiftRed" | "shiftBlue" | "distortion" | "contour" | "angle"
>;

export const TONE_PARAMS: Record<MetalTone, Tuned> = {
  silver: {
    colorBack: "#a7abb1", colorTint: "#ffffff",
    repetition: 3, softness: 0.18, shiftRed: 0.32, shiftBlue: 0.32, distortion: 0.14, contour: 0.55, angle: 68,
  },
  gold: {
    colorBack: "#7d6019", colorTint: "#ffe7a0",
    repetition: 3, softness: 0.2, shiftRed: 0.28, shiftBlue: 0.14, distortion: 0.13, contour: 0.5, angle: 68,
  },
  gunmetal: {
    colorBack: "#33373d", colorTint: "#b2bac4",
    repetition: 2.6, softness: 0.26, shiftRed: 0.22, shiftBlue: 0.32, distortion: 0.1, contour: 0.45, angle: 80,
  },
  obsidian: {
    colorBack: "#000000", colorTint: "#6c6c74",
    repetition: 2, softness: 0.42, shiftRed: 0.12, shiftBlue: 0.22, distortion: 0.06, contour: 0.3, angle: 92,
  },
};

/** True once mounted on the client — the WebGL canvas can't render during SSR. */
export function useMounted(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/**
 * Reports whether `ref` is on/near screen. Each metal surface is a WebGL
 * canvas, and browsers cap concurrent contexts (~16) — so we only mount the
 * shader while it's visible and release the context when it scrolls away.
 */
function useInView(ref: React.RefObject<Element | null>, margin = "250px"): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}

export interface MetalFillProps {
  tone: MetalTone;
  /** Shader animation speed (0 pauses). */
  speed?: number;
  /** Pattern scale — higher spreads the bands out. */
  scale?: number;
}

/** The shader canvas, absolutely filling its positioned parent (when in view). */
export function MetalFill({ tone, speed = 1, scale = 1.1 }: MetalFillProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const mounted = useMounted();
  const inView = useInView(ref);
  return (
    <span ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      {mounted && inView && (
        <LiquidMetal
          shape="none"
          fit="cover"
          scale={scale}
          speed={speed}
          {...TONE_PARAMS[tone]}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}
    </span>
  );
}
