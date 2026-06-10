import { forwardRef, useEffect, useRef, useState } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";
import { TONE_PARAMS, useInView, useMounted, useReducedMotion, useStaggeredMount, type MetalTone } from "./metal";

/** Where the metal lives in shader text: the whole glyph, or just its edge. */
export type MetalTextVariant = "fill" | "outline";

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
  /**
   * Shader mode: `"fill"` (metal fills the glyphs, default) or `"outline"` —
   * the metal runs around the edge of each letterform and the interior takes
   * `fill` / `fillGradient`.
   */
  variant?: MetalTextVariant;
  /** Interior colour for `variant="outline"`. */
  fill?: string;
  /** Interior vertical gradient `[top, bottom]` for `variant="outline"` — wins over `fill`. */
  fillGradient?: [string, string];
  /** Metal edge thickness in px for `variant="outline"`. Defaults to ~5% of the font size. */
  outlineWidth?: number;
  /** Type size in px (shader mode). Defaults to `64`. */
  fontSize?: number;
  /** Weight for the glyph silhouette (shader mode). Defaults to `800`. */
  fontWeight?: number;
  /**
   * Font for the silhouette (shader mode). Rendered inside an SVG image, which
   * sees system fonts only — to use a webfont, pass `fontCss` with a
   * data-URI @font-face for the same family.
   */
  fontFamily?: string;
  /**
   * Raw CSS embedded in the glyph SVG (shader mode) — typically a @font-face
   * whose `src` is a data: URI, which lets webfonts (e.g. Google Fonts) render
   * inside the silhouette. Load the same face into `document.fonts` so the
   * width measurement matches.
   */
  fontCss?: string;
  /** Shader animation speed (0 pauses). */
  speed?: number;
}

const DEFAULT_STACK = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif";

interface GlyphGeom {
  text: string;
  w: number;
  h: number;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  fontCss?: string;
}

function svgOpen(g: GlyphGeom): string {
  const style = g.fontCss ? `<style>${g.fontCss}</style>` : "";
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${g.w} ${g.h}' width='${g.w}' height='${g.h}'>${style}`;
}

function svgText(g: GlyphGeom, attrs: string): string {
  const safe = g.text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<text x='50%' y='${Math.round(g.fontSize * 1.0)}' font-size='${g.fontSize}' font-family="${g.fontFamily.replace(/"/g, "'")}" font-weight='${g.fontWeight}' text-anchor='middle' ${attrs}>${safe}</text>`;
}

function encode(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Solid glyphs — the shader fills the whole letterform. */
function fillSilhouette(g: GlyphGeom): string {
  return encode(`${svgOpen(g)}${svgText(g, "fill='#000'")}</svg>`);
}

/** Stroke-only glyphs — the shader flows in a ring around each letterform. */
function outlineSilhouette(g: GlyphGeom, ow: number): string {
  return encode(`${svgOpen(g)}${svgText(g, `fill='none' stroke='#000' stroke-width='${ow}' stroke-linejoin='round'`)}</svg>`);
}

/** The interior of outline text — flat or gradient fill, geometry-identical to the silhouette. */
function interior(g: GlyphGeom, fill: string, gradient?: [string, string]): string {
  if (!gradient) return encode(`${svgOpen(g)}${svgText(g, `fill='${fill}'`)}</svg>`);
  const defs = `<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${gradient[0]}'/><stop offset='1' stop-color='${gradient[1]}'/></linearGradient></defs>`;
  return encode(`${svgOpen(g)}${defs}${svgText(g, "fill='url(#g)'")}</svg>`);
}

const LAYER: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

function ShaderText({
  text,
  tone,
  variant,
  fill,
  fillGradient,
  outlineWidth,
  fontSize,
  fontWeight,
  fontFamily,
  fontCss,
  speed,
  shimmer,
  className,
  style,
  ...rest
}: {
  text: string;
  tone: MetalTone;
  variant: MetalTextVariant;
  fill: string;
  fillGradient?: [string, string];
  outlineWidth?: number;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  fontCss?: string;
  speed: number;
  shimmer: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLSpanElement>(null);
  const mounted = useMounted();
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const turn = useStaggeredMount();
  const [geom, setGeom] = useState<GlyphGeom | null>(null);

  const outlined = variant === "outline";
  const ow = outlineWidth ?? Math.max(2, Math.round(fontSize * 0.05));

  useEffect(() => {
    let alive = true;
    const fontSpec = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const measure = () => {
      if (!alive) return;
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = fontSpec;
      const m = ctx.measureText(text);
      setGeom({
        text,
        w: Math.ceil(m.width + fontSize * 0.24 + ow * 2),
        h: Math.ceil(fontSize * 1.3 + ow),
        fontSize,
        fontWeight,
        fontFamily,
        fontCss,
      });
    };
    // wait for webfonts so the measured width matches the silhouette
    if (document.fonts?.load) document.fonts.load(fontSpec, text).then(measure, measure);
    else measure();
    return () => {
      alive = false;
    };
  }, [text, fontSize, fontWeight, fontFamily, fontCss, ow]);

  const ready = mounted && inView && turn && geom;
  const { colorBack: _drop, ...params } = TONE_PARAMS[tone];
  // a thin ring can't survive heavy edge distortion — calm it down for outlines
  const shaderParams = outlined ? { ...params, contour: 0.2, distortion: Math.min(params.distortion ?? 0.1, 0.08) } : params;

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
        width: geom?.w,
        height: geom?.h,
        ...style,
      }}
      {...rest}
    >
      {ready ? (
        <>
          {outlined && <img src={interior(geom, fill, fillGradient)} alt="" aria-hidden="true" style={LAYER} />}
          <LiquidMetal
            image={outlined ? outlineSilhouette(geom, ow) : fillSilhouette(geom)}
            suspendWhenProcessingImage={false}
            colorBack="#00000000"
            fit="contain"
            scale={0.97}
            speed={reduced ? 0 : speed}
            {...shaderParams}
            style={LAYER}
          />
        </>
      ) : (
        // CSS chrome stands in until the shader is ready (and during SSR)
        <span
          aria-hidden="true"
          className={["argent-text", shimmer && !outlined && "argent-text--shimmer"].filter(Boolean).join(" ")}
          data-tone={tone}
          style={{
            fontSize,
            fontWeight,
            fontFamily,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            ...(outlined && {
              background: "none",
              WebkitTextFillColor: fillGradient?.[0] ?? fill,
              color: fillGradient?.[0] ?? fill,
              WebkitTextStroke: "1px rgba(220, 224, 230, 0.55)",
            }),
          }}
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
 * real liquid-metal shader into the letterforms — `variant="fill"` floods the
 * glyphs; `variant="outline"` runs the metal around their edges over a dark or
 * gradient interior.
 */
export const MetalText = forwardRef<HTMLElement, MetalTextProps>(function MetalText(
  {
    as,
    tone = "silver",
    shimmer = true,
    shader = false,
    variant = "fill",
    fill = "#101114",
    fillGradient,
    outlineWidth,
    fontSize = 64,
    fontWeight = 800,
    fontFamily = DEFAULT_STACK,
    fontCss,
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
        variant={variant}
        fill={fill}
        fillGradient={fillGradient}
        outlineWidth={outlineWidth}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fontFamily={fontFamily}
        fontCss={fontCss}
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
