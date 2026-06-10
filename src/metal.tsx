import { useEffect, useRef, useState } from "react";
import { LiquidMetal, type LiquidMetalParams } from "@paper-design/shaders-react";
import { mountMetal, NATIVE_TONES, type MetalEngine, type MetalMount, type NativeMetalParams } from "./engine";

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

/**
 * Finishes — shader presets tuned to the shape and size of the element. One
 * pattern does not fit all: a card wants broad flowing bands, a thin progress
 * bar wants many stripes crossing it, a 22px toggle thumb wants one soft
 * highlight like a ball bearing, and a hairline badge rim wants dense bands so
 * a tiny visible slice always catches some light.
 */
export type MetalFinish = "surface" | "button" | "bar" | "orb" | "rim";

interface FinishTuning {
  /** Band direction override (deg). */
  angle?: number;
  /** Random per-mount angle variation (±deg) so identical elements don't look cloned. */
  angleJitter?: number;
  repetition?: number;
  softness?: number;
  distortion?: number;
  /** Multiplier on the tone's chromatic shift. */
  shift?: number;
  /** Default pattern scale. */
  scale?: number;
  /** Multiplier on the animation speed. */
  speed?: number;
}

export const FINISHES: Record<MetalFinish, FinishTuning> = {
  /** Cards, nav, panels — broad flowing reflection bands (the tone defaults). */
  surface: { scale: 1.1 },
  /** Buttons — slightly spread, calmer warp so labels stay readable. */
  button: { scale: 1.4, distortion: 0.1 },
  /** Thin horizontal strips (progress) — near-vertical stripes crossing the bar. */
  bar: { angle: 14, repetition: 5, softness: 0.3, distortion: 0.06, shift: 0.5, scale: 0.8, speed: 0.75 },
  /** Small round things (toggle thumbs) — one soft highlight, like a polished sphere. */
  orb: { angle: 112, angleJitter: 20, repetition: 1.7, softness: 0.5, distortion: 0.05, shift: 0.4, scale: 1.5 },
  /** Hairline edges (badges, thin borders) — dense bands so any slice sparkles. */
  rim: { angle: 40, repetition: 4.5, softness: 0.3, distortion: 0.08, shift: 0.5, scale: 0.85, speed: 0.85 },
};

/**
 * Effects — the character of the liquid's motion, independent of tone and
 * finish: how soft the bands are, how hard the noise churns them, how fast
 * everything moves.
 */
export type MetalEffect = "flow" | "molten" | "ripple" | "chrome" | "wave";

interface EffectTuning {
  angle?: number;
  repetition?: number;
  softness?: number;
  distortion?: number;
  /** Multiplier on chromatic shift. */
  shift?: number;
  /** Multiplier on animation speed. */
  speed?: number;
}

export const EFFECTS: Record<MetalEffect, EffectTuning> = {
  /** The default — steady flowing reflection bands. */
  flow: {},
  /** Slow, heavy, half-melted — soft wide bands churning lazily. */
  molten: { softness: 0.5, distortion: 0.3, speed: 0.45, shift: 0.6 },
  /** Agitated surface — tighter bands, hard noise, quick motion. */
  ripple: { repetition: 4, softness: 0.24, distortion: 0.5, speed: 1.4 },
  /** Mirror-polished — crisp hard bands, strong chromatic fringe, calm. */
  chrome: { softness: 0.05, distortion: 0.05, shift: 1.6, speed: 0.8 },
  /** Horizontal swells rolling through the surface. */
  wave: { angle: 0, repetition: 5, softness: 0.36, distortion: 0.18, speed: 0.7 },
};

export interface MetalFillProps {
  tone: MetalTone;
  /** Shader animation speed (0 pauses). */
  speed?: number;
  /** Pattern scale — higher spreads the bands out. Defaults per finish. */
  scale?: number;
  /** `"paper"` (Paper's LiquidMetal, default) or `"native"` (Argent's own shader). */
  engine?: MetalEngine;
  /** Shape-tuned shader preset. Defaults to `"surface"`. */
  finish?: MetalFinish;
  /** Motion character preset. Defaults to `"flow"`. */
  effect?: MetalEffect;
  /** Band direction in degrees — overrides the tone/finish default. */
  angle?: number;
}

const FILL_STYLE: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

/** Argent's own clean-room shader on a plain canvas. */
function NativeCanvas({ params }: { params: NativeMetalParams }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountRef = useRef<MetalMount | null>(null);
  const initial = useRef(params);
  initial.current = params;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    mountRef.current = mountMetal(canvas, initial.current);
    return () => {
      mountRef.current?.destroy();
      mountRef.current = null;
    };
  }, []);
  useEffect(() => {
    mountRef.current?.update(params);
  }, [params]);
  return <canvas ref={canvasRef} style={{ ...FILL_STYLE, display: "block" }} />;
}

/** The shader canvas, absolutely filling its positioned parent (when in view). */
export function MetalFill({ tone, speed = 1, scale, engine = "paper", finish = "surface", effect = "flow", angle }: MetalFillProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const mounted = useMounted();
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const f = FINISHES[finish];
  const e = EFFECTS[effect];
  const [jitter] = useState(() => (f.angleJitter ? (Math.random() * 2 - 1) * f.angleJitter : 0));

  const base = TONE_PARAMS[tone];
  // precedence: explicit prop > effect > finish > tone
  const effAngle = (angle ?? e.angle ?? f.angle ?? base.angle ?? 70) + jitter;
  const effScale = scale ?? f.scale ?? 1.1;
  const effSpeed = (reduced ? 0 : speed) * (f.speed ?? 1) * (e.speed ?? 1);
  const shift = (f.shift ?? 1) * (e.shift ?? 1);
  const repetition = e.repetition ?? f.repetition ?? base.repetition;
  const softness = e.softness ?? f.softness ?? base.softness;
  const distortion = e.distortion ?? f.distortion ?? base.distortion;

  const native = NATIVE_TONES[tone];
  const nativeParams: NativeMetalParams = {
    ...native,
    angle: effAngle,
    repetition: repetition ?? native.repetition,
    softness: softness ?? native.softness,
    // the native warp amount runs ~3× paper's distortion scale
    distortion: distortion !== undefined ? distortion * 3 : native.distortion,
    dispersion: native.dispersion * shift,
    speed: effSpeed,
    scale: effScale,
  };

  return (
    <span ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      {mounted && inView && (
        engine === "native" ? (
          <NativeCanvas params={nativeParams} />
        ) : (
          <LiquidMetal
            shape="none"
            fit="cover"
            scale={effScale}
            speed={effSpeed}
            {...base}
            angle={effAngle}
            repetition={repetition}
            softness={softness}
            distortion={distortion}
            shiftRed={(base.shiftRed ?? 0.3) * shift}
            shiftBlue={(base.shiftBlue ?? 0.3) * shift}
            style={FILL_STYLE}
          />
        )
      )}
    </span>
  );
}
