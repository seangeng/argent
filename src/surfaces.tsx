import { forwardRef } from "react";
import { METAL_FILTERS, useMetalFilters, type MetalLiquid } from "./metal";

function cx(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

function assignRef<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

export type MetalTone = "silver" | "gold" | "gunmetal" | "obsidian";

export interface MetalProps extends React.HTMLAttributes<HTMLElement> {
  /** Element/component to render. Defaults to `div`. */
  as?: React.ElementType;
  /** Metal finish. */
  tone?: MetalTone;
  /** Corner radius in px. */
  radius?: number;
  /** Liquid ripple strength: `ripple` (default), `flow` (stronger), or `false`. */
  liquid?: MetalLiquid;
  /** A specular streak that sweeps across on hover. */
  sheen?: boolean;
}

function filterValue(liquid: MetalLiquid, ready: boolean): string | undefined {
  if (!liquid || !ready) return undefined;
  return `url(#${METAL_FILTERS[liquid]})`;
}

/**
 * A liquid-metal surface — an animated chrome gradient that ripples like
 * mercury. The foundation for every Argent component; render any element via `as`.
 */
export const Metal = forwardRef<HTMLElement, MetalProps>(function Metal(
  { as, tone = "silver", radius = 14, liquid = "ripple", sheen = false, className, style, children, ...rest },
  ref,
) {
  const ready = useMetalFilters();
  const Tag = (as ?? "div") as React.ElementType;
  const fv = filterValue(liquid, ready);

  return (
    <Tag
      ref={(node: HTMLElement | null) => assignRef(ref, node)}
      className={cx("argent", sheen && "argent--sheen", className)}
      data-tone={tone}
      style={{ borderRadius: radius, ...style }}
      {...rest}
    >
      <span
        className="argent-fill"
        aria-hidden="true"
        style={fv ? { filter: fv, WebkitFilter: fv } : undefined}
      />
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
  liquid?: MetalLiquid;
}

/** A liquid-metal button — flowing chrome, a sheen sweep, and a stamped press. */
export const MetalButton = forwardRef<HTMLButtonElement, MetalButtonProps>(function MetalButton(
  { tone = "silver", size = "md", liquid = "ripple", type = "button", className, children, ...rest },
  ref,
) {
  const ready = useMetalFilters();
  const fv = filterValue(liquid, ready);

  return (
    <button
      ref={ref}
      type={type}
      className={cx("argent", "argent--sheen", "argent-btn", `argent-btn--${size}`, className)}
      data-tone={tone}
      {...rest}
    >
      <span className="argent-fill" aria-hidden="true" style={fv ? { filter: fv, WebkitFilter: fv } : undefined} />
      <span className="argent-sheen" aria-hidden="true" />
      <span className="argent-content argent-btn-label">{children}</span>
    </button>
  );
});
