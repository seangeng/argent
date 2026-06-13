import type { MetalTone } from "argentui";

/** Reusable demo controls, Glacé-style: flat, labelled, joined segments. */

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <label className="lab-slider" data-disabled={disabled || undefined}>
      <span className="lab-slider-row">
        <span>{label}</span>
        <span className="lab-slider-val">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  render,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  /** Optional custom button content (e.g. font chips in their own face). */
  render?: (option: T) => React.ReactNode;
}) {
  return (
    <div className="ctrl-field">
      <span className="ctrl-label">{label}</span>
      <div className="seg">
        {options.map((o) => (
          <button key={o} data-on={value === o} onClick={() => onChange(o)}>
            {render ? render(o) : o}
          </button>
        ))}
      </div>
    </div>
  );
}

const TONES: MetalTone[] = ["silver", "gold", "gunmetal", "obsidian", "cobalt", "crimson", "amethyst", "emerald"];

/** Tone segment with a real metal swatch per option. */
export function ToneSegmented({ value, onChange }: { value: MetalTone; onChange: (t: MetalTone) => void }) {
  return (
    <div className="ctrl-field">
      <span className="ctrl-label">tone</span>
      <div className="seg">
        {TONES.map((t) => (
          <button key={t} data-on={value === t} onClick={() => onChange(t)}>
            <span className="tone-dot" data-tone={t} aria-hidden="true" />
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button className="pg-toggle" data-on={on} onClick={onClick}>
      <span className="dot" aria-hidden="true" />
      {label}
    </button>
  );
}
