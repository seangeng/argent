import { useState } from "react";
import { Metal, type MetalTone, type MetalLiquid } from "argentui";
import { CodeBlock } from "./CodeBlock";

const TONES: MetalTone[] = ["silver", "gold", "gunmetal", "obsidian"];
const LIQUIDS: { label: string; value: MetalLiquid }[] = [
  { label: "ripple", value: "ripple" },
  { label: "flow", value: "flow" },
  { label: "off", value: false },
];

export function MetalLab() {
  const [tone, setTone] = useState<MetalTone>("silver");
  const [radius, setRadius] = useState(20);
  const [liquid, setLiquid] = useState<MetalLiquid>("ripple");
  const [sheen, setSheen] = useState(true);

  const liquidStr = liquid === false ? "false" : `"${liquid}"`;
  const code = `<Metal
  tone="${tone}"
  radius={${radius}}
  liquid={${liquidStr}}${sheen ? "\n  sheen" : ""}
>
  <div style={{ padding: 28 }}>Argent</div>
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
          <label>Liquid</label>
          <div className="seg">
            {LIQUIDS.map((l) => (
              <button key={l.label} data-on={liquid === l.value} onClick={() => setLiquid(l.value)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ctl">
          <label>Sheen</label>
          <div className="seg">
            <button data-on={sheen} onClick={() => setSheen(true)}>
              on
            </button>
            <button data-on={!sheen} onClick={() => setSheen(false)}>
              off
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="stage lab-stage">
          <Metal tone={tone} radius={radius} liquid={liquid} sheen={sheen}>
            <div style={{ padding: 36, fontSize: 22, fontWeight: 680, letterSpacing: "-0.03em", minWidth: 200, textAlign: "center" }}>
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
