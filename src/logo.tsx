import { useRef } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";
import { TONE_PARAMS, useInView, useMounted, useReducedMotion, useStaggeredMount, type MetalTone } from "./metal";

export interface MetalLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URL (or data URI) with a transparent background — the metal flows inside its silhouette. */
  src: string;
  tone?: MetalTone;
  /** Rendered size in px (square by default). */
  size?: number;
  width?: number;
  height?: number;
  /** Shader animation speed (0 pauses). */
  speed?: number;
}

/**
 * Liquid metal poured into a logo — pass any image with a transparent
 * background and the metal flows inside its silhouette. The classic
 * liquid-metal treatment for marks, monograms, and icons.
 */
export function MetalLogo({ src, tone = "silver", size = 160, width, height, speed = 1, style, ...rest }: MetalLogoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const turn = useStaggeredMount();
  const w = width ?? size;
  const h = height ?? size;
  const { colorBack: _drop, ...params } = TONE_PARAMS[tone];
  return (
    <div ref={ref} style={{ position: "relative", width: w, height: h, ...style }} {...rest}>
      {mounted && inView && turn && (
        <LiquidMetal
          image={src}
          suspendWhenProcessingImage={false}
          colorBack="#00000000"
          fit="contain"
          scale={0.92}
          speed={reduced ? 0 : speed}
          {...params}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
