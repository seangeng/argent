import { forwardRef, useEffect, useRef, useState } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";
import { TONE_PARAMS, useInView, useMounted, useReducedMotion, useStaggeredMount, type MetalTone } from "./metal";

export interface MetalTextProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to `span`. */
  as?: React.ElementType;
  tone?: MetalTone;
  /** Animate the highlight band across the glyphs (CSS mode). Defaults to `true`. */
  shimmer?: boolean;
  /**
   * Pour the real liquid-metal shader into the glyphs — flowing bands, liquid
   * edges, chromatic fringe. Costs a WebGL canvas; the CSS gradient renders as
   * a placeholder until the shader is ready, and stands in wherever WebGL
   * isn't. Children must be a plain string in this mode.
   */
  shader?: boolean;
  /** Type size in px (shader mode). Defaults to `64`. */
  fontSize?: number;
  /** Weight for the glyph silhouette (shader mode). Defaults to `800`. */
  fontWeight?: number;
  /**
   * Font for the silhouette (shader mode). Rendered inside an SVG image, which
   * can only see system fonts — webfonts won't resolve there.
   */
  fontFamily?: string;
  /** Shader animation speed (0 pauses). */
  speed?: number;
}

const DEFAULT_STACK = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif";

function textToSvg(text: string, w: number, h: number, fontSize: number, fontWeight: number, fontFamily: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' width='${w}' height='${h}'><text x='50%' y='${Math.round(fontSize * 1.0)}' font-size='${fontSize}' font-family="${fontFamily.replace(/"/g, "'")}" font-weight='${fontWeight}' text-anchor='middle' fill='#000'>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function ShaderText({
  text,
  tone,
  fontSize,
  fontWeight,
  fontFamily,
  speed,
  shimmer,
  className,
  style,
  ...rest
}: {
  text: string;
  tone: MetalTone;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  speed: number;
  shimmer: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLSpanElement>(null);
  const mounted = useMounted();
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const turn = useStaggeredMount();
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const m = ctx.measureText(text);
    setDims({ w: Math.ceil(m.width + fontSize * 0.24), h: Math.ceil(fontSize * 1.3) });
  }, [text, fontSize, fontWeight, fontFamily]);

  const ready = mounted && inView && turn && dims;
  const { colorBack: _drop, ...params } = TONE_PARAMS[tone];

  return (
    <span
      ref={ref}
      role="img"
      aria-label={text}
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        verticalAlign: "middle",
        width: dims?.w,
        height: dims?.h,
        ...style,
      }}
      {...rest}
    >
      {ready ? (
        <LiquidMetal
          image={textToSvg(text, dims.w, dims.h, fontSize, fontWeight, fontFamily)}
          suspendWhenProcessingImage={false}
          colorBack="#00000000"
          fit="contain"
          scale={0.97}
          speed={reduced ? 0 : speed}
          {...params}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      ) : (
        // CSS chrome stands in until the shader is ready (and during SSR)
        <span
          aria-hidden="true"
          className={["argent-text", shimmer && "argent-text--shimmer"].filter(Boolean).join(" ")}
          data-tone={tone}
          style={{ fontSize, fontWeight, fontFamily, lineHeight: 1.3, whiteSpace: "nowrap" }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

/**
 * Metal type. By default a chrome gradient clipped to the glyphs with a flowing
 * shimmer — pure CSS, use it freely at any scale. Pass `shader` to pour the
 * real liquid-metal shader into the letterforms instead: flowing reflection
 * bands, liquid edges, chromatic fringe (one WebGL canvas per instance).
 */
export const MetalText = forwardRef<HTMLElement, MetalTextProps>(function MetalText(
  {
    as,
    tone = "silver",
    shimmer = true,
    shader = false,
    fontSize = 64,
    fontWeight = 800,
    fontFamily = DEFAULT_STACK,
    speed = 1,
    className,
    children,
    ...rest
  },
  ref,
) {
  if (shader) {
    return (
      <ShaderText
        text={String(children)}
        tone={tone}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fontFamily={fontFamily}
        speed={speed}
        shimmer={shimmer}
        className={className}
        {...rest}
      />
    );
  }
  const Tag = (as ?? "span") as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={["argent-text", shimmer && "argent-text--shimmer", className].filter(Boolean).join(" ")}
      data-tone={tone}
      {...rest}
    >
      {children}
    </Tag>
  );
});
