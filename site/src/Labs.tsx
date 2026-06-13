import { useEffect, useRef, useState } from "react";
import { Metal, MetalButton, MetalIcon, MetalLogo, MetalText, type MetalEffect, type MetalTone } from "argentui";
import { Bell, Heart, Settings, Sparkles, Star, Zap } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { Segmented, ToneSegmented, Toggle } from "./Controls";

/* ── Effects: motion characters on the Metal primitive ─────────────────── */

const EFFECT_BLURBS: Record<MetalEffect, string> = {
  flow: "steady flowing bands — the default",
  molten: "slow, heavy, half-melted",
  ripple: "agitated — tight bands, hard noise",
  chrome: "mirror-polished, crisp, strong fringe",
  wave: "horizontal swells rolling through",
};
const EFFECT_KEYS = Object.keys(EFFECT_BLURBS) as MetalEffect[];

export function EffectsDemo() {
  const [effect, setEffect] = useState<MetalEffect>("flow");
  const [tone, setTone] = useState<MetalTone>("gold");
  return (
    <div className="playground">
      <div className="stage stage--demo">
        <Metal tone={tone} variant="fill" radius={24} effect={effect} metalScale={1.4} sheen>
          <div className="fx-label">{effect}</div>
        </Metal>
      </div>
      <div className="controls">
        <Segmented label="effect" value={effect} options={EFFECT_KEYS} onChange={setEffect} />
        <ToneSegmented value={tone} onChange={setTone} />
      </div>
      <p className="demo-note">{EFFECT_BLURBS[effect]}</p>
      <CodeBlock code={`<Metal tone="${tone}" variant="fill" effect="${effect}" sheen>…</Metal>`} />
    </div>
  );
}

/* ── Logo lab: known marks + custom upload ──────────────────────────────── */

const ARGENT_A =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><text x='100' y='162' font-size='190' font-family='Helvetica, Arial, sans-serif' font-weight='800' text-anchor='middle' fill='#000'>A</text></svg>`,
  );

const BRANDS: { name: string; slug: string | null }[] = [
  { name: "Argent", slug: null },
  { name: "GitHub", slug: "github" },
  { name: "Apple", slug: "apple" },
  { name: "Spotify", slug: "spotify" },
  { name: "X", slug: "x" },
  { name: "Vercel", slug: "vercel" },
];
const BRAND_NAMES = BRANDS.map((b) => b.name);

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

  const pick = async (name: string) => {
    setActive(name);
    const slug = BRANDS.find((b) => b.name === name)?.slug ?? null;
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
    <div className="playground">
      <div className="stage stage--demo">
        <MetalLogo src={src} tone={tone} size={180} />
      </div>
      <div className="controls">
        <div className="ctrl-field">
          <span className="ctrl-label">mark</span>
          <div className="seg">
            {BRAND_NAMES.map((name) => (
              <button key={name} data-on={active === name} onClick={() => pick(name)}>
                {name}
              </button>
            ))}
            <button data-on={active === "custom"} onClick={() => fileRef.current?.click()}>
              upload…
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/svg+xml,image/webp"
            style={{ display: "none" }}
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </div>
        <ToneSegmented value={tone} onChange={setTone} />
      </div>
      <p className="demo-note">Any image with a transparent background works — try your own mark.</p>
      <CodeBlock code={`<MetalLogo src="/logo.svg" tone="${tone}" size={180} />`} />
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
const FONT_NAMES = GOOGLE_FONTS.map((f) => f.name);

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
  const [fontPick, setFontPick] = useState("Playfair Display");
  const [tone, setTone] = useState<MetalTone>("silver");
  const [outline, setOutline] = useState(false);
  const [font, setFont] = useState<LoadedFont | null>(null);
  const [loading, setLoading] = useState(false);

  // live preview: pour as you type (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim()) setText(input.trim());
    }, 450);
    return () => clearTimeout(t);
  }, [input]);

  // preload every face once so chips render in their own font and switching is instant
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
    <div className="playground">
      <div className="stage stage--demo" style={{ minHeight: 170 }}>
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
      <div className="controls">
        <div className="ctrl-field">
          <span className="ctrl-label">text</span>
          <input
            className="text-input"
            value={input}
            maxLength={18}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your words"
            aria-label="Text to render in metal"
          />
        </div>
        <Segmented
          label={loading ? "font — loading…" : "font"}
          value={fontPick}
          options={FONT_NAMES}
          onChange={setFontPick}
          render={(name) => (
            <span
              style={
                name === "System"
                  ? undefined
                  : { fontFamily: `'${name}'`, fontWeight: GOOGLE_FONTS.find((f) => f.name === name)?.weight }
              }
            >
              {name}
            </span>
          )}
        />
        <ToneSegmented value={tone} onChange={setTone} />
        <Toggle label="outline" on={outline} onClick={() => setOutline(!outline)} />
      </div>
      <p className="demo-note">Google Fonts work too — the face is embedded into the glyph silhouette as a data URI.</p>
      <CodeBlock code={code} />
    </div>
  );
}

/* ── Icon lab: pour metal into any SVG icon (lucide / heroicons / raw) ──── */

const ICONS = [
  { name: "Sparkles", el: <Sparkles /> },
  { name: "Heart", el: <Heart /> },
  { name: "Bolt", el: <Zap /> },
  { name: "Star", el: <Star /> },
  { name: "Bell", el: <Bell /> },
  { name: "Settings", el: <Settings /> },
];

export function IconLab() {
  const [tone, setTone] = useState<MetalTone>("silver");
  return (
    <div className="playground">
      <div className="stage stage--demo" style={{ flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
          {ICONS.map((i) => (
            <MetalIcon key={i.name} icon={i.el} tone={tone} size={42} aria-label={i.name} />
          ))}
        </div>
        <MetalButton tone={tone} variant="fill" icon={<Sparkles />}>
          Get started
        </MetalButton>
      </div>
      <div className="controls">
        <ToneSegmented value={tone} onChange={setTone} />
      </div>
      <p className="demo-note">
        The real liquid-metal shader, poured into each icon (one canvas each, gated to the viewport).
        Pass a lucide-react / Heroicons element, raw SVG, or a URL.
      </p>
      <CodeBlock
        code={`import { MetalIcon, MetalButton } from "argentui";
import { Sparkles } from "lucide-react";

<MetalIcon icon={<Sparkles />} tone="${tone}" size={32} />
<MetalButton icon={<Sparkles />}>Get started</MetalButton>`}
      />
    </div>
  );
}
