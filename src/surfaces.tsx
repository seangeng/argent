import { forwardRef } from "react";
import { MetalFill, type MetalEffect, type MetalFinish, type MetalTone } from "./metal";
import type { MetalEngine } from "./engine";
import { PRESS_PATTERN, vibrate } from "./haptics";

function cx(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

function assignRef<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

/** Where the liquid metal shows: just the edge, or the whole surface. */
export type MetalVariant = "border" | "fill";

/** Border framing: a single rim, or a rim plus an inner hairline frame. */
export type MetalFrame = "single" | "double";

type StyleVars = React.CSSProperties & Record<`--${string}`, string>;

export interface MetalProps extends React.HTMLAttributes<HTMLElement> {
  /** Element/component to render. Defaults to `div`. */
  as?: React.ElementType;
  /** Metal finish. */
  tone?: MetalTone;
  /** `"border"` (metal edge only, default) or `"fill"` (metal fills the surface). */
  variant?: MetalVariant;
  /** `"single"` rim (default) or `"double"` — rim plus an inner hairline frame. */
  frame?: MetalFrame;
  /** Let the metal show faintly through the interior panel (border variant). */
  tint?: boolean;
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
  /** Shader engine: Paper's LiquidMetal (default) or Argent's own. */
  engine?: MetalEngine;
  /** Shape-tuned shader preset. Defaults to `"surface"`. */
  finish?: MetalFinish;
  /** Motion character: flow, molten, ripple, chrome, or wave. */
  effect?: MetalEffect;
  /** Band direction in degrees — overrides the tone/finish default. */
  angle?: number;
  /** A specular streak that sweeps across on hover. */
  sheen?: boolean;
  /**
   * A frosted standoff ring outside the metal — a few px of backdrop blur
   * finished with a ~5% hairline. `true` for 8px, or a number for the ring
   * width. Theme the line with `--argent-halo-line`.
   */
  halo?: boolean | number;
}

function buildVars(radius: number, borderWidth: number, halo: boolean | number, style?: React.CSSProperties): StyleVars {
  const vars: StyleVars = {
    borderRadius: radius,
    "--argent-bw": `${borderWidth}px`,
    "--argent-radius": `${radius}px`,
    ...style,
  } as StyleVars;
  if (halo) vars["--argent-halo"] = `${halo === true ? 8 : halo}px`;
  return vars;
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
    frame = "single",
    tint = false,
    borderWidth = 1.5,
    revealOnHover = false,
    radius = 14,
    speed,
    metalScale,
    engine,
    finish,
    effect,
    angle,
    sheen = false,
    halo = false,
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
      className={cx(
        "argent",
        border ? "argent--border" : "argent--fill",
        border && frame === "double" && "argent--double",
        border && tint && "argent--tint",
        revealOnHover && "argent--reveal",
        sheen && "argent--sheen",
        !!halo && "argent--halo",
        className,
      )}
      data-tone={tone}
      style={buildVars(radius, borderWidth, halo, style)}
      {...rest}
    >
      <span className="argent-fill" aria-hidden="true">
        <MetalFill tone={tone} speed={speed} scale={metalScale} engine={engine} finish={finish} effect={effect} angle={angle} />
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
  /** `"border"` (default — readable, fills on hover) or `"fill"` (full chrome). */
  variant?: MetalVariant;
  /** Corner radius in px. */
  radius?: number;
  borderWidth?: number;
  /** Fill with metal on hover (border variant). Defaults to `true`. */
  revealOnHover?: boolean;
  /** Vibrate on press where supported. Defaults to `true`. */
  haptics?: boolean;
  speed?: number;
  engine?: MetalEngine;
  finish?: MetalFinish;
  effect?: MetalEffect;
  angle?: number;
  halo?: boolean | number;
}

const SIZE_RADIUS = { sm: 11, md: 13, lg: 15 } as const;

/** A liquid-metal button — readable at rest, molten on hover, with a stamped press. */
export const MetalButton = forwardRef<HTMLButtonElement, MetalButtonProps>(function MetalButton(
  { tone = "silver", size = "md", variant = "border", radius, borderWidth = 1.5, revealOnHover = true, haptics = true, speed, engine, finish = "button", effect, angle, halo = false, type = "button", className, children, style, onPointerDown, ...rest },
  ref,
) {
  const border = variant === "border";
  return (
    <button
      ref={ref}
      type={type}
      onPointerDown={(e) => {
        if (haptics) vibrate(PRESS_PATTERN);
        onPointerDown?.(e);
      }}
      className={cx("argent", border ? "argent--border" : "argent--fill", border && revealOnHover && "argent--reveal", "argent--sheen", !!halo && "argent--halo", "argent-btn", `argent-btn--${size}`, className)}
      data-tone={tone}
      style={buildVars(radius ?? SIZE_RADIUS[size], borderWidth, halo, style)}
      {...rest}
    >
      <span className="argent-fill" aria-hidden="true">
        <MetalFill tone={tone} speed={speed} engine={engine} finish={finish} effect={effect} angle={angle} />
      </span>
      {border && <span className="argent-core" aria-hidden="true" />}
      <span className="argent-sheen" aria-hidden="true" />
      <span className="argent-content argent-btn-label">{children}</span>
    </button>
  );
});
