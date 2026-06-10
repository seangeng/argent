import { forwardRef } from "react";
import type { MetalTone } from "./metal";

export interface MetalTextProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to `span`. */
  as?: React.ElementType;
  tone?: MetalTone;
  /** Animate the highlight band across the glyphs. Defaults to `true`. */
  shimmer?: boolean;
}

/**
 * Chrome text — a metallic gradient clipped to the glyphs, with an optional
 * flowing shimmer. Pure CSS (no WebGL), so use it freely at any scale.
 */
export const MetalText = forwardRef<HTMLElement, MetalTextProps>(function MetalText(
  { as, tone = "silver", shimmer = true, className, children, ...rest },
  ref,
) {
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
