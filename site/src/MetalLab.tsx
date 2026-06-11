import { useState } from "react";
import { Metal, type MetalTone, type MetalVariant, type MetalFrame, type MetalEngine, type MetalFinish } from "argentui";
import { CodeBlock } from "./CodeBlock";
import { Segmented, Slider, Toggle, ToneSegmented } from "./Controls";

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
  const [autoAngle, setAutoAngle] = useState(true);
  const [angle, setAngle] = useState(68);

  const border = variant === "border";
  const code = `<Metal
  tone="${tone}"
  variant="${variant}"${border && frame === "double" ? `\n  frame="double"` : ""}${border && tint ? "\n  tint" : ""}${border && reveal ? "\n  revealOnHover" : ""}
  radius={${radius}}
  speed={${speed}}
  metalScale={${metalScale}}${finish !== "surface" ? `\n  finish="${finish}"` : ""}${!autoAngle ? `\n  angle={${angle}}` : ""}${engine === "native" ? `\n  engine="native"` : ""}${halo ? "\n  halo" : ""}${sheen ? "\n  sheen" : ""}
>
  <div style={{ padding: 36 }}>Argent</div>
</Metal>`;

  return (
    <div className="playground">
      <div className="stage stage--demo lab-stage">
        <Metal
          tone={tone}
          variant={variant}
          frame={frame}
          tint={tint}
          revealOnHover={border && reveal}
          radius={radius}
          speed={speed}
          metalScale={metalScale}
          engine={engine}
          finish={finish}
          angle={autoAngle ? undefined : angle}
          halo={halo}
          sheen={sheen}
        >
          <div style={{ padding: 40, fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", minWidth: 220, textAlign: "center" }}>
            Argent
          </div>
        </Metal>
      </div>

      <div className="controls">
        <ToneSegmented value={tone} onChange={setTone} />
        <Segmented label="variant" value={variant} options={VARIANTS} onChange={setVariant} />
        {border && <Segmented label="frame" value={frame} options={FRAMES} onChange={setFrame} />}
        <Segmented label="finish" value={finish} options={FINISHES} onChange={setFinish} />
        <Segmented label="engine" value={engine} options={ENGINES} onChange={setEngine} />
      </div>

      <div className="controls">
        <Slider label="Radius" value={radius} min={0} max={48} onChange={setRadius} suffix="px" />
        <Slider label="Speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} suffix="×" />
        <Slider label="Scale" value={metalScale} min={0.4} max={2.4} step={0.1} onChange={setMetalScale} suffix="×" />
        <Slider label={autoAngle ? "Angle (auto)" : "Angle"} value={angle} min={0} max={180} onChange={(v) => { setAngle(v); setAutoAngle(false); }} suffix="°" />
      </div>

      <div className="controls">
        <Toggle label="auto angle" on={autoAngle} onClick={() => setAutoAngle(!autoAngle)} />
        {border && <Toggle label="tint" on={tint} onClick={() => setTint(!tint)} />}
        {border && <Toggle label="fill on hover" on={reveal} onClick={() => setReveal(!reveal)} />}
        <Toggle label="halo" on={halo} onClick={() => setHalo(!halo)} />
        <Toggle label="sheen" on={sheen} onClick={() => setSheen(!sheen)} />
      </div>

      <div style={{ marginTop: 16 }}>
        <CodeBlock code={code} lang="tsx" />
      </div>
    </div>
  );
}
