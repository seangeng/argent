import { forwardRef, useState } from "react";
import { MetalFill, type MetalTone } from "./metal";
import { Metal, type MetalProps } from "./surfaces";
import { PRESS_PATTERN, vibrate } from "./haptics";

export interface MetalToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  tone?: MetalTone;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Vibrate on toggle where supported. Defaults to `true`. */
  haptics?: boolean;
}

/**
 * A mercury switch — the thumb is a drop of liquid metal that slides (and
 * squishes) across a dark channel.
 */
export const MetalToggle = forwardRef<HTMLButtonElement, MetalToggleProps>(function MetalToggle(
  { tone = "silver", checked, defaultChecked = false, onCheckedChange, haptics = true, className, onClick, ...rest },
  ref,
) {
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked ?? internal;
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={isOn}
      data-tone={tone}
      data-checked={isOn || undefined}
      className={["argent-toggle", className].filter(Boolean).join(" ")}
      onClick={(e) => {
        if (haptics) vibrate(PRESS_PATTERN);
        if (checked === undefined) setInternal(!isOn);
        onCheckedChange?.(!isOn);
        onClick?.(e);
      }}
      {...rest}
    >
      <span className="argent-toggle-thumb" aria-hidden="true">
        <MetalFill tone={tone} scale={2.4} />
      </span>
    </button>
  );
});

export interface MetalProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: MetalTone;
  /** 0–100. Omit for an indeterminate molten sweep. */
  value?: number;
  /** Track height in px. */
  height?: number;
}

/** A molten progress bar — liquid metal rising in a dark channel. */
export const MetalProgress = forwardRef<HTMLDivElement, MetalProgressProps>(function MetalProgress(
  { tone = "silver", value, height = 10, className, style, ...rest },
  ref,
) {
  const indeterminate = value === undefined;
  const clamped = indeterminate ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : clamped}
      data-tone={tone}
      className={["argent-progress", indeterminate && "argent-progress--indeterminate", className].filter(Boolean).join(" ")}
      style={{ height, ...style }}
      {...rest}
    >
      <span
        className="argent-progress-fill"
        style={indeterminate ? undefined : { width: `${clamped}%` }}
        aria-hidden="true"
      >
        <MetalFill tone={tone} scale={1.6} />
      </span>
    </div>
  );
});

export interface MetalBadgeProps extends Omit<MetalProps, "as" | "variant"> {}

/** A small liquid-metal pill — a metal rim around a quiet label. */
export const MetalBadge = forwardRef<HTMLElement, MetalBadgeProps>(function MetalBadge(
  { className, radius = 999, borderWidth = 1, metalScale = 2.2, ...rest },
  ref,
) {
  return (
    <Metal
      ref={ref}
      as="span"
      variant="border"
      radius={radius}
      borderWidth={borderWidth}
      metalScale={metalScale}
      className={["argent-badge", className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
});
