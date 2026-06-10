import { useState } from "react";
import { Metal, type MetalTone, type MetalVariant, type MetalFrame, type MetalEngine, type MetalFinish } from "argentui";
import { CodeBlock } from "./CodeBlock";

const TONES: MetalTone[] = ["silver", "gold", "gunmetal", "obsidian"];
const VARIANTS: MetalVariant[] = ["border", "fill"];
const FRAMES: MetalFrame[] = ["single", "double"];
const ENGINES: MetalEngine[] = ["paper", "native"];
const FINISHES: MetalFinish[] = ["surface", "button", "bar", "orb", "rim"];

export function MetalLab() {
  const [tone, setTone] = useState<MetalTone>("silver");
  const [variant, setVariant] = useState<MetalVariant>("border");
  const [frame, setFrame] = useState<MetalFrame>("single");
  const [tint, setTint] = useState(false);
  const [reveal, setReveal] = useState(true);
  const [radius, setRadius] = useState(20);
  const [speed, setSpeed] = useState(1);
  const [metalScale, setMetalScale] = useState(1.1);
  const [sheen, setSheen] = useState(true);
  const [halo, setHalo] = useState(false);
  const [engine, setEngine] = useState<MetalEngine>("paper");
  const [finish, setFinish] = useState<MetalFinish>("surface");
  const [angle, setAngle] = useState<number | null>(null);

  const showReveal = variant === "border";
  const code = `<Metal
  tone="${tone}"
  variant="${variant}"${variant === "border" && frame === "double" ? `\n  frame="double"` : ""}${variant === "border" && tint ? "\n  tint" : ""}${showReveal && reveal ? "\n  revealOnHover" : ""}
  radius={${radius}}
  speed={${speed}}
  metalScale={${metalScale}}${finish !== "surface" ? `\n  finish="${finish}"` : ""}${angle !== null ? `\n  angle={${angle}}` : ""}${engine === "native" ? `\n  engine="native"` : ""}${halo ? "\n  halo" : ""}${sheen ? "\n  sheen" : ""}
>
  <div style={{ padding: 36 }}>Argent</div>
</Metal>`;

  return (
    <div className="lab">
      <div className="controls">
        <div className="ctl">
          <label>Tone</label>
          <div className="seg">
            {TONES.map((t) => (
              <button key={t} data-on={tone === t} onClick={() => setTone(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="ctl">
          <label>Engine</label>
          <div className="seg">
            {ENGINES.map((e) => (
              <button key={e} data-on={engine === e} onClick={() => setEngine(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="ctl">
          <label>Finish</label>
          <div className="seg">
            {FINISHES.map((fi) => (
              <button key={fi} data-on={finish === fi} onClick={() => setFinish(fi)}>
                {fi}
              </button>
            ))}
          </div>
        </div>
        <div className="ctl">
          <label>
            Angle <b>{angle === null ? "auto" : `${angle}°`}</b>
          </label>
          <input type="range" min={0} max={180} value={angle ?? 68} onChange={(e) => setAngle(+e.target.value)} />
          {angle !== null && (
            <div className="seg">
              <button data-on={false} onClick={() => setAngle(null)}>reset to auto</button>
            </div>
          )}
        </div>
        <div className="ctl">
          <label>Variant</label>
          <div className="seg">
            {VARIANTS.map((v) => (
              <button key={v} data-on={variant === v} onClick={() => setVariant(v)}>
                {v}
              </button>
            ))}
          </div>
        </div>
        {showReveal && (
          <div className="ctl">
            <label>Frame</label>
            <div className="seg">
              {FRAMES.map((f) => (
                <button key={f} data-on={frame === f} onClick={() => setFrame(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
        {showReveal && (
          <div className="ctl">
            <label>Tint inside</label>
            <div className="seg">
              <button data-on={tint} onClick={() => setTint(true)}>on</button>
              <button data-on={!tint} onClick={() => setTint(false)}>off</button>
            </div>
          </div>
        )}
        {showReveal && (
          <div className="ctl">
            <label>Fill on hover</label>
            <div className="seg">
              <button data-on={reveal} onClick={() => setReveal(true)}>on</button>
              <button data-on={!reveal} onClick={() => setReveal(false)}>off</button>
            </div>
          </div>
        )}
        <div className="ctl">
          <label>
            Radius <b>{radius}px</b>
          </label>
          <input type="range" min={0} max={48} value={radius} onChange={(e) => setRadius(+e.target.value)} />
        </div>
        <div className="ctl">
          <label>
            Speed <b>{speed.toFixed(1)}</b>
          </label>
          <input type="range" min={0} max={3} step={0.1} value={speed} onChange={(e) => setSpeed(+e.target.value)} />
        </div>
        <div className="ctl">
          <label>
            Scale <b>{metalScale.toFixed(1)}</b>
          </label>
          <input type="range" min={0.4} max={2.4} step={0.1} value={metalScale} onChange={(e) => setMetalScale(+e.target.value)} />
        </div>
        <div className="ctl">
          <label>Halo</label>
          <div className="seg">
            <button data-on={halo} onClick={() => setHalo(true)}>on</button>
            <button data-on={!halo} onClick={() => setHalo(false)}>off</button>
          </div>
        </div>
        <div className="ctl">
          <label>Sheen</label>
          <div className="seg">
            <button data-on={sheen} onClick={() => setSheen(true)}>on</button>
            <button data-on={!sheen} onClick={() => setSheen(false)}>off</button>
          </div>
        </div>
      </div>

      <div>
        <div className="stage lab-stage">
          <Metal tone={tone} variant={variant} frame={frame} tint={tint} revealOnHover={showReveal && reveal} radius={radius} speed={speed} metalScale={metalScale} engine={engine} finish={finish} angle={angle ?? undefined} halo={halo} sheen={sheen}>
            <div style={{ padding: 40, fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", minWidth: 220, textAlign: "center" }}>
              Argent
            </div>
          </Metal>
        </div>
        <div style={{ marginTop: 14 }}>
          <CodeBlock code={code} lang="tsx" />
        </div>
      </div>
    </div>
  );
}
