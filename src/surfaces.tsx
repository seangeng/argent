import { forwardRef } from "react";
import { MetalFill, type MetalTone } from "./metal";

function cx(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

function assignRef<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

export interface MetalProps extends React.HTMLAttributes<HTMLElement> {
  /** Element/component to render. Defaults to `div`. */
  as?: React.ElementType;
  /** Metal finish. */
  tone?: MetalTone;
  /** Corner radius in px. */
  radius?: number;
  /** Shader animation speed (0 pauses the metal). */
  speed?: number;
  /** Pattern scale — higher spreads the reflection bands out. */
  metalScale?: number;
  /** A specular streak that sweeps across on hover. */
  sheen?: boolean;
}

/**
 * A liquid-metal surface powered by Paper's `LiquidMetal` shader. The base for
 * every Argent component; render any element via `as`.
 */
export const Metal = forwardRef<HTMLElement, MetalProps>(function Metal(
  { as, tone = "silver", radius = 14, speed, metalScale, sheen = false, className, style, children, ...rest },
  ref,
) {
  const Tag = (as ?? "div") as React.ElementType;
  return (
    <Tag
      ref={(node: HTMLElement | null) => assignRef(ref, node)}
      className={cx("argent", sheen && "argent--sheen", className)}
      data-tone={tone}
      style={{ borderRadius: radius, ...style }}
      {...rest}
    >
      <span className="argent-fill" aria-hidden="true">
        <MetalFill tone={tone} speed={speed} scale={metalScale} />
      </span>
      {sheen && <span className="argent-sheen" aria-hidden="true" />}
      <span className="argent-content">{children}</span>
    </Tag>
  );
});

export interface MetalCardProps extends MetalProps {}

/** A padded liquid-metal container. */
export const MetalCard = forwardRef<HTMLElement, MetalCardProps>(function MetalCard(
  { className, radius = 18, ...rest },
  ref,
) {
  return <Metal ref={ref} radius={radius} className={cx("argent-card", className)} {...rest} />;
});

export interface MetalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: MetalTone;
  size?: "sm" | "md" | "lg";
  speed?: number;
}

/** A liquid-metal button — a flowing shader finish, a sheen sweep, a stamped press. */
export const MetalButton = forwardRef<HTMLButtonElement, MetalButtonProps>(function MetalButton(
  { tone = "silver", size = "md", speed, type = "button", className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("argent", "argent--sheen", "argent-btn", `argent-btn--${size}`, className)}
      data-tone={tone}
      {...rest}
    >
      <span className="argent-fill" aria-hidden="true">
        <MetalFill tone={tone} speed={speed} scale={0.9} />
      </span>
      <span className="argent-sheen" aria-hidden="true" />
      <span className="argent-content argent-btn-label">{children}</span>
    </button>
  );
});
