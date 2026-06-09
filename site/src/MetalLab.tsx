import { useState } from "react";
import { Metal, type MetalTone } from "argentui";
import { CodeBlock } from "./CodeBlock";

const TONES: MetalTone[] = ["silver", "gold", "gunmetal", "obsidian"];

export function MetalLab() {
  const [tone, setTone] = useState<MetalTone>("silver");
  const [radius, setRadius] = useState(20);
  const [speed, setSpeed] = useState(1);
  const [metalScale, setMetalScale] = useState(1.1);
  const [sheen, setSheen] = useState(true);

  const code = `<Metal
  tone="${tone}"
  radius={${radius}}
  speed={${speed}}
  metalScale={${metalScale}}${sheen ? "\n  sheen" : ""}
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
          <label>Sheen</label>
          <div className="seg">
            <button data-on={sheen} onClick={() => setSheen(true)}>on</button>
            <button data-on={!sheen} onClick={() => setSheen(false)}>off</button>
          </div>
        </div>
      </div>

      <div>
        <div className="stage lab-stage">
          <Metal tone={tone} radius={radius} speed={speed} metalScale={metalScale} sheen={sheen}>
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
