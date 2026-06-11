import { useEffect, useRef, useState } from "react";
import { Metal, MetalLogo, MetalText, type MetalEffect, type MetalTone } from "argentui";
import { CodeBlock } from "./CodeBlock";

const TONES: MetalTone[] = ["silver", "gold", "gunmetal", "obsidian"];

/** A labeled control row — keeps the lab panels scannable. */
export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ctl-row">
      <span className="ctl-row-label">{label}</span>
      <div className="seg ctl-row-seg">{children}</div>
    </div>
  );
}

/** Tone chips with a real metal swatch — the colour you'll actually get. */
export function ToneSeg({ value, onChange }: { value: MetalTone; onChange: (t: MetalTone) => void }) {
  return (
    <>
      {TONES.map((t) => (
        <button key={t} className="tone-chip" data-on={value === t} onClick={() => onChange(t)}>
          <span className="tone-dot" data-tone={t} aria-hidden="true" />
          {t}
        </button>
      ))}
    </>
  );
}

/* ── Effects: motion characters on the Metal primitive ─────────────────── */

const EFFECTS: { key: MetalEffect; blurb: string }[] = [
  { key: "flow", blurb: "steady flowing bands — the default" },
  { key: "molten", blurb: "slow, heavy, half-melted" },
  { key: "ripple", blurb: "agitated — tight bands, hard noise" },
  { key: "chrome", blurb: "mirror-polished, crisp, strong fringe" },
  { key: "wave", blurb: "horizontal swells rolling through" },
];

export function EffectsDemo() {
  const [effect, setEffect] = useState<MetalEffect>("flow");
  const [tone, setTone] = useState<MetalTone>("gold");
  const blurb = EFFECTS.find((e) => e.key === effect)!.blurb;
  return (
    <div>
      <div className="stage" style={{ flexDirection: "column", gap: 18 }}>
        <Metal tone={tone} variant="fill" radius={24} effect={effect} metalScale={1.4} sheen>
          <div style={{ padding: "44px 56px", fontSize: 20, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)" }}>
            {effect}
          </div>
        </Metal>
        <div className="ctl-rows">
          <Row label="Effect">
            {EFFECTS.map((e) => (
              <button key={e.key} data-on={effect === e.key} onClick={() => setEffect(e.key)}>
                {e.key}
              </button>
            ))}
          </Row>
          <Row label="Tone">
            <ToneSeg value={tone} onChange={setTone} />
          </Row>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>{blurb}</p>
      </div>
      <div style={{ marginTop: 14 }}>
        <CodeBlock code={`<Metal tone="${tone}" variant="fill" effect="${effect}" sheen>…</Metal>`} />
      </div>
    </div>
  );
}

/* ── Logo lab: known marks + custom upload ──────────────────────────────── */

const ARGENT_A =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><text x='100' y='162' font-size='190' font-family='Helvetica, Arial, sans-serif' font-weight='800' text-anchor='middle' fill='#000'>A</text></svg>`,
  );

const BRANDS = [
  { name: "Argent", slug: null },
  { name: "GitHub", slug: "github" },
  { name: "Apple", slug: "apple" },
  { name: "Spotify", slug: "spotify" },
  { name: "X", slug: "x" },
  { name: "Vercel", slug: "vercel" },
];

const brandCache = new Map<string, string>();
async function brandDataUri(slug: string): Promise<string> {
  const hit = brandCache.get(slug);
  if (hit) return hit;
  const svg = await fetch(`https://cdn.simpleicons.org/${slug}/000000`).then((r) => r.text());
  const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  brandCache.set(slug, uri);
  return uri;
}

export function LogoLab() {
  const [active, setActive] = useState("Argent");
  const [src, setSrc] = useState(ARGENT_A);
  const [tone, setTone] = useState<MetalTone>("silver");
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (name: string, slug: string | null) => {
    setActive(name);
    setSrc(slug ? await brandDataUri(slug) : ARGENT_A);
  };

  const upload = (file: File | undefined) => {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      setActive("custom");
      setSrc(fr.result as string);
    };
    fr.readAsDataURL(file);
  };

  return (
    <div>
      <div className="stage" style={{ flexDirection: "column", gap: 18 }}>
        <MetalLogo src={src} tone={tone} size={180} />
        <div className="ctl-rows">
          <Row label="Mark">
            {BRANDS.map((b) => (
              <button key={b.name} data-on={active === b.name} onClick={() => pick(b.name, b.slug)}>
                {b.name}
              </button>
            ))}
            <button data-on={active === "custom"} onClick={() => fileRef.current?.click()}>
              upload…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/svg+xml,image/webp"
              style={{ display: "none" }}
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </Row>
          <Row label="Tone">
            <ToneSeg value={tone} onChange={setTone} />
          </Row>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
          Any image with a transparent background works — try your own mark.
        </p>
      </div>
      <div style={{ marginTop: 14 }}>
        <CodeBlock code={`<MetalLogo src="/logo.svg" tone="${tone}" size={180} />`} />
      </div>
    </div>
  );
}

/* ── Text lab: your words, Google Fonts, poured metal ───────────────────── */

// each family pinned to a weight it actually ships — requesting a missing
// weight makes the css2 API 400 and the font silently never applies
const GOOGLE_FONTS: { name: string; weight: number }[] = [
  { name: "System", weight: 800 },
  { name: "Playfair Display", weight: 800 },
  { name: "Bebas Neue", weight: 400 },
  { name: "Space Grotesk", weight: 700 },
  { name: "Oswald", weight: 700 },
  { name: "Pacifico", weight: 400 },
  { name: "Unbounded", weight: 800 },
];

interface LoadedFont {
  family: string;
  weight: number;
  css: string;
}
const fontCache = new Map<string, LoadedFont>();

async function loadGoogleFont(family: string, weight: number): Promise<LoadedFont> {
  const key = `${family}:${weight}`;
  const hit = fontCache.get(key);
  if (hit) return hit;
  const fetchCss = (w?: number) =>
    fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}${w ? `:wght@${w}` : ""}&display=swap`).then((r) =>
      r.ok ? r.text() : "",
    );
  let css = await fetchCss(weight);
  if (!css.includes(".woff2")) css = await fetchCss(); // weight missing — take the default face
  const urls = [...css.matchAll(/url\((https:[^)]+\.woff2)\)/g)].map((m) => m[1]);
  const woff2 = urls[urls.length - 1]; // latin block is listed last
  if (!woff2) throw new Error(`no woff2 for ${family}`);
  const blob = await fetch(woff2).then((r) => r.blob());
  const dataUrl = await new Promise<string>((res) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.readAsDataURL(blob);
  });
  // make it measurable on the page…
  const face = new FontFace(family, `url(${dataUrl})`, { weight: String(weight) });
  await face.load();
  document.fonts.add(face);
  // …and renderable inside the glyph SVG
  const loaded = {
    family,
    weight,
    css: `@font-face{font-family:'${family}';src:url(${dataUrl}) format('woff2');font-weight:${weight};}`,
  };
  fontCache.set(key, loaded);
  return loaded;
}

export function TextLab() {
  const [input, setInput] = useState("Argent");
  const [text, setText] = useState("Argent");

  // live preview: pour as you type (debounced), Enter/button for instant
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim()) setText(input.trim());
    }, 450);
    return () => clearTimeout(t);
  }, [input]);
  const [fontPick, setFontPick] = useState("Playfair Display");
  const [tone, setTone] = useState<MetalTone>("silver");
  const [outline, setOutline] = useState(false);
  const [font, setFont] = useState<LoadedFont | null>(null);
  const [loading, setLoading] = useState(false);

  // preload every face once so chips render in their own font and
  // switching is instant (each is a small cached woff2)
  useEffect(() => {
    GOOGLE_FONTS.forEach((f) => {
      if (f.name !== "System") loadGoogleFont(f.name, f.weight).catch(() => {});
    });
  }, []);

  useEffect(() => {
    let alive = true;
    if (fontPick === "System") {
      setFont(null);
      return;
    }
    setLoading(true);
    const pick = GOOGLE_FONTS.find((f) => f.name === fontPick)!;
    loadGoogleFont(pick.name, pick.weight)
      .then((f) => alive && setFont(f))
      .catch(() => alive && setFont(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [fontPick]);

  const fontProps = font ? { fontFamily: `'${font.family}'`, fontCss: font.css, fontWeight: font.weight } : {};
  const code = `<MetalText shader tone="${tone}"${outline ? `\n  variant="outline" fillGradient={["#23262c", "#0a0b0d"]}` : ""}${font ? `\n  fontFamily="'${font.family}'" fontCss={googleFontFace}` : ""}>
  ${text}
</MetalText>`;

  return (
    <div>
      <div className="stage" style={{ flexDirection: "column", gap: 18 }}>
        <div style={{ minHeight: 96, display: "flex", alignItems: "center" }}>
          <MetalText
            shader
            tone={tone}
            fontSize={Math.max(34, 76 - text.length * 2.4)}
            {...(outline ? { variant: "outline" as const, fillGradient: ["#23262c", "#0a0b0d"] as [string, string] } : {})}
            {...fontProps}
          >
            {text}
          </MetalText>
        </div>
        <div className="row" style={{ justifyContent: "center", gap: 10 }}>
          <input
            className="text-input"
            value={input}
            maxLength={18}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input.trim() && setText(input.trim())}
            placeholder="Your words"
            aria-label="Text to render in metal"
          />
          <button className="pour" onClick={() => input.trim() && setText(input.trim())}>
            pour it
          </button>
        </div>
        <div className="ctl-rows">
          <Row label="Font">
            {GOOGLE_FONTS.map((f) => (
              <button
                key={f.name}
                className="font-chip"
                style={f.name === "System" ? undefined : { fontFamily: `'${f.name}'`, fontWeight: f.weight }}
                data-on={fontPick === f.name}
                disabled={loading && fontPick !== f.name}
                onClick={() => setFontPick(f.name)}
              >
                {loading && fontPick === f.name ? "…" : f.name}
              </button>
            ))}
          </Row>
          <Row label="Tone">
            <ToneSeg value={tone} onChange={setTone} />
          </Row>
          <Row label="Style">
            <button data-on={!outline} onClick={() => setOutline(false)}>filled</button>
            <button data-on={outline} onClick={() => setOutline(true)}>outline</button>
          </Row>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
          {loading ? "Loading font…" : "Google Fonts work too — the face is embedded into the glyph silhouette as a data URI."}
        </p>
      </div>
      <div style={{ marginTop: 14 }}>
        <CodeBlock code={code} />
      </div>
    </div>
  );
}
