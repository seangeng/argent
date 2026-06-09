import { forwardRef } from "react";
import { MetalFill, type MetalTone } from "./metal";

function cx(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

function assignRef<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/** Where the liquid metal shows: just the edge, or the whole surface. */
export type MetalVariant = "border" | "fill";

type StyleVars = React.CSSProperties & Record<`--${string}`, string>;

export interface MetalProps extends React.HTMLAttributes<HTMLElement> {
  /** Element/component to render. Defaults to `div`. */
  as?: React.ElementType;
  /** Metal finish. */
  tone?: MetalTone;
  /** `"border"` (metal edge only, default) or `"fill"` (metal fills the surface). */
  variant?: MetalVariant;
  /** Border thickness in px (border variant). */
  borderWidth?: number;
  /** Fill the whole surface with metal on hover (border variant). */
  revealOnHover?: boolean;
  /** Corner radius in px. */
  radius?: number;
  /** Shader animation speed (0 pauses the metal). */
  speed?: number;
  /** Pattern scale — higher spreads the reflection bands out. */
  metalScale?: number;
  /** A specular streak that sweeps across on hover. */
  sheen?: boolean;
}

function buildVars(radius: number, borderWidth: number, style?: React.CSSProperties): StyleVars {
  return { borderRadius: radius, "--argent-bw": `${borderWidth}px`, ...style } as StyleVars;
}

/**
 * A liquid-metal surface powered by Paper's `LiquidMetal` shader. By default the
 * metal is just the edge; pass `variant="fill"` for a full metal surface, or
 * `revealOnHover` to fill in on interaction. The base for every Argent component.
 */
export const Metal = forwardRef<HTMLElement, MetalProps>(function Metal(
  {
    as,
    tone = "silver",
    variant = "border",
    borderWidth = 1.5,
    revealOnHover = false,
    radius = 14,
    speed,
    metalScale,
    sheen = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Tag = (as ?? "div") as React.ElementType;
  const border = variant === "border";
  return (
    <Tag
      ref={(node: HTMLElement | null) => assignRef(ref, node)}
      className={cx("argent", border ? "argent--border" : "argent--fill", revealOnHover && "argent--reveal", sheen && "argent--sheen", className)}
      data-tone={tone}
      style={buildVars(radius, borderWidth, style)}
      {...rest}
    >
      <span className="argent-fill" aria-hidden="true">
        <MetalFill tone={tone} speed={speed} scale={metalScale} />
      </span>
      {border && <span className="argent-core" aria-hidden="true" />}
      {sheen && <span className="argent-sheen" aria-hidden="true" />}
      <span className="argent-content">{children}</span>
    </Tag>
  );
});

export interface MetalCardProps extends MetalProps {}

/** A padded liquid-metal container. Metal edge by default. */
export const MetalCard = forwardRef<HTMLElement, MetalCardProps>(function MetalCard(
  { className, radius = 18, ...rest },
  ref,
) {
  return <Metal ref={ref} radius={radius} className={cx("argent-card", className)} {...rest} />;
});

export interface MetalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: MetalTone;
  size?: "sm" | "md" | "lg";
  /** `"fill"` (default for buttons) or `"border"`. */
  variant?: MetalVariant;
  borderWidth?: number;
  revealOnHover?: boolean;
  speed?: number;
}

/** A liquid-metal button — a flowing shader finish, a sheen sweep, a stamped press. */
export const MetalButton = forwardRef<HTMLButtonElement, MetalButtonProps>(function MetalButton(
  { tone = "silver", size = "md", variant = "fill", borderWidth = 1.5, revealOnHover = false, speed, type = "button", className, children, style, ...rest },
  ref,
) {
  const border = variant === "border";
  return (
    <button
      ref={ref}
      type={type}
      className={cx("argent", border ? "argent--border" : "argent--fill", revealOnHover && "argent--reveal", "argent--sheen", "argent-btn", `argent-btn--${size}`, className)}
      data-tone={tone}
      style={buildVars(999, borderWidth, style)}
      {...rest}
    >
      <span className="argent-fill" aria-hidden="true">
        <MetalFill tone={tone} speed={speed} scale={0.9} />
      </span>
      {border && <span className="argent-core" aria-hidden="true" />}
      <span className="argent-sheen" aria-hidden="true" />
      <span className="argent-content argent-btn-label">{children}</span>
    </button>
  );
});
