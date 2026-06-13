import { useEffect, useRef, useState } from "react";
import { MetalLogo } from "./logo";
import type { MetalTone } from "./metal";

/**
 * Liquid metal poured into an icon. Pass any SVG icon — a React element from
 * lucide-react / heroicons, a raw SVG string, or a URL — and it renders filled
 * with metal.
 *
 * By default the metal is an animated chrome gradient clipped to the icon with
 * a CSS mask: cheap, crisp at any size, no WebGL, SSR-safe. Pass `shader` for
 * the real liquid-metal shader (one WebGL canvas — best for large/hero icons).
 */
export interface MetalIconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** A React SVG element, e.g. `<Beaker />` (lucide) or `<BeakerIcon />` (heroicons). */
  icon?: React.ReactNode;
  /** Raw SVG markup (alternative to `icon`). */
  svg?: string;
  /** SVG URL or data URI (alternative to `icon`). */
  src?: string;
  tone?: MetalTone;
  /** Rendered size in px (square). Defaults to `24`. */
  size?: number;
  /** Animate the highlight (CSS mode). Defaults to `true`. */
  shimmer?: boolean;
  /** Use the real liquid-metal shader instead of the CSS gradient. */
  shader?: boolean;
  /** Shader animation speed (shader mode). */
  speed?: number;
}

function svgToUri(markup: string): string {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}

function serialize(svg: SVGElement): string {
  const clone = svg.cloneNode(true) as SVGElement;
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return svgToUri(new XMLSerializer().serializeToString(clone));
}

/** Resolve `svg`/`src`, or serialize the icon rendered into `ref`, to a data URI. */
function useIconUri({ svg, src }: Pick<MetalIconProps, "svg" | "src">) {
  const ref = useRef<HTMLSpanElement>(null);
  const direct = src ?? (svg ? svgToUri(svg) : null);
  const [uri, setUri] = useState<string | null>(direct);
  useEffect(() => {
    if (direct) {
      setUri(direct);
      return;
    }
    const node = ref.current?.querySelector("svg");
    if (!node) return;
    const next = serialize(node as unknown as SVGElement);
    // most icons are static — only re-set when the markup actually changes
    setUri((prev) => (prev === next ? prev : next));
  });
  return { ref, uri, fromNode: !direct };
}

export function MetalIcon({
  icon,
  svg,
  src,
  tone = "silver",
  size = 24,
  shimmer = true,
  shader = false,
  speed = 1,
  className,
  style,
  ...rest
}: MetalIconProps) {
  const { ref, uri, fromNode } = useIconUri({ svg, src });
  const cls = ["argent-icon-wrap", className].filter(Boolean).join(" ");
  return (
    <span className={cls} style={{ display: "inline-flex", width: size, height: size, ...style }} {...rest}>
      {fromNode && (
        <span ref={ref} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", color: "#000" }}>
          {icon}
        </span>
      )}
      {uri &&
        (shader ? (
          <MetalLogo src={uri} tone={tone} size={size} speed={speed} />
        ) : (
          <span
            className={["argent-icon", shimmer && "argent-icon--shimmer"].filter(Boolean).join(" ")}
            data-tone={tone}
            aria-hidden="true"
            style={{
              width: size,
              height: size,
              WebkitMaskImage: `url("${uri}")`,
              maskImage: `url("${uri}")`,
            }}
          />
        ))}
    </span>
  );
}
