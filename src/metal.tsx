import { useEffect, useRef, useState } from "react";
import { LiquidMetal, type LiquidMetalParams } from "@paper-design/shaders-react";
import { mountMetal, NATIVE_TONES, type MetalEngine, type MetalMount } from "./engine";

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
    colorBack: "#94700e", colorTint: "#ffedb0",
    repetition: 3, softness: 0.2, shiftRed: 0.3, shiftBlue: 0.12, distortion: 0.13, contour: 0.5, angle: 68,
  },
  gunmetal: {
    colorBack: "#33373d", colorTint: "#b2bac4",
    repetition: 2.6, softness: 0.26, shiftRed: 0.22, shiftBlue: 0.32, distortion: 0.1, contour: 0.45, angle: 80,
  },
  obsidian: {
    colorBack: "#000000", colorTint: "#9498a6",
    repetition: 2, softness: 0.4, shiftRed: 0.14, shiftBlue: 0.24, distortion: 0.07, contour: 0.32, angle: 92,
  },
};

// Paper's image pre-processing misbehaves when several image-mask shaders
// initialise at once (only one survives) — serialise mounts a beat apart.
let imageMountQueue: Promise<void> = Promise.resolve();
export function useStaggeredMount(): boolean {
  const [go, setGo] = useState(false);
  useEffect(() => {
    let alive = true;
    imageMountQueue = imageMountQueue.then(async () => {
      if (alive) setGo(true);
      await new Promise((r) => setTimeout(r, 500));
    });
    return () => {
      alive = false;
    };
  }, []);
  return go;
}

/** True once mounted on the client — the WebGL canvas can't render during SSR. */
export function useMounted(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** True when the user prefers reduced motion — the metal freezes (speed 0). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Reports whether `ref` is on/near screen. Each metal surface is a WebGL
 * canvas, and browsers cap concurrent contexts (~16) — so we only mount the
 * shader while it's visible and release the context when it scrolls away.
 */
export function useInView(ref: React.RefObject<Element | null>, margin = "250px"): boolean {
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
  /** `"paper"` (Paper's LiquidMetal, default) or `"native"` (Argent's own shader). */
  engine?: MetalEngine;
}

const FILL_STYLE: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

/** Argent's own clean-room shader on a plain canvas. */
function NativeCanvas({ tone, speed, scale }: { tone: MetalTone; speed: number; scale: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountRef = useRef<MetalMount | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    mountRef.current = mountMetal(canvas, { ...NATIVE_TONES[tone], speed, scale });
    return () => {
      mountRef.current?.destroy();
      mountRef.current = null;
    };
    // remount only when the tone changes; speed/scale update in place below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tone]);
  useEffect(() => {
    mountRef.current?.update({ speed, scale });
  }, [speed, scale]);
  return <canvas ref={canvasRef} style={{ ...FILL_STYLE, display: "block" }} />;
}

/** The shader canvas, absolutely filling its positioned parent (when in view). */
export function MetalFill({ tone, speed = 1, scale = 1.1, engine = "paper" }: MetalFillProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const mounted = useMounted();
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const effSpeed = reduced ? 0 : speed;
  return (
    <span ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      {mounted && inView && (
        engine === "native" ? (
          <NativeCanvas tone={tone} speed={effSpeed} scale={scale} />
        ) : (
          <LiquidMetal
            shape="none"
            fit="cover"
            scale={scale}
            speed={effSpeed}
            {...TONE_PARAMS[tone]}
            style={FILL_STYLE}
          />
        )
      )}
    </span>
  );
}
