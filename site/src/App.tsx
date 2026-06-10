import { useEffect, useState } from "react";
import { Metal, MetalCard, MetalButton, MetalText, MetalLogo, MetalToggle, MetalProgress, MetalBadge, type MetalTone } from "argentui";
import { CodeBlock } from "./CodeBlock";
import { MetalLab } from "./MetalLab";

const LOGO_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><text x='100' y='162' font-size='190' font-family='Helvetica, Arial, sans-serif' font-weight='800' text-anchor='middle' fill='#000'>A</text></svg>`,
  );

function ProgressDemo() {
  const [value, setValue] = useState(12);
  useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 8 : v + Math.random() * 16)), 900);
    return () => clearInterval(id);
  }, []);
  return <MetalProgress tone="silver" value={Math.min(100, value)} style={{ width: 260 }} />;
}

const TONES: MetalTone[] = ["silver", "gold", "gunmetal", "obsidian"];
const MARK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='.5' stop-color='%23888'/%3E%3Cstop offset='1' stop-color='%23fff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='2' y='2' width='20' height='20' rx='6' fill='url(%23g)'/%3E%3C/svg%3E";

function CopyInstall() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="install">
      <span className="dollar">$</span>
      <code>npm i argentui</code>
      <button
        onClick={() => {
          navigator.clipboard?.writeText("npm i argentui");
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

export function App() {
  return (
    <>
      {/* Header */}
      <header className="nav">
        <Metal as="nav" tone="silver" radius={16} speed={0.5} sheen className="nav-metal">
          <div className="nav-inner">
            <span className="brand">
              <img className="brand-mark" src={MARK} alt="" />
              Argent
            </span>
            <span className="nav-links">
              <a href="#buttons">Buttons</a>
              <a href="#styles">Styles</a>
              <a href="#logo">Logos</a>
              <a href="#controls">Controls</a>
              <a href="#lab">Lab</a>
              <a href="https://github.com/seangeng/argent">GitHub</a>
              <a href="https://www.npmjs.com/package/argentui">npm</a>
            </span>
          </div>
        </Metal>
      </header>

      <div className="wrap">
        {/* Hero */}
        <div className="hero">
          <h1>
            Liquid <MetalText tone="silver">metal</MetalText>
            <br />
            for React
          </h1>
          <p className="lede">
            Flowing chrome, gold, and gunmetal surfaces that ripple like mercury — real liquid
            metal, powered by Paper's WebGL shader, wrapped in components. A metal sibling to{" "}
            <a href="https://glaceui.com" style={{ color: "#cdd2da" }}>
              Glacé
            </a>
            .
          </p>
          <div className="cta">
            <CopyInstall />
            <MetalButton tone="silver" size="lg" onClick={() => window.open("https://github.com/seangeng/argent", "_blank")}>
              GitHub
            </MetalButton>
          </div>
        </div>

        {/* Showcase */}
        <div className="stage" style={{ marginBottom: 8 }}>
          {TONES.map((t) => (
            <Metal key={t} tone={t} radius={18} borderWidth={2.5} revealOnHover sheen>
              <div style={{ padding: "30px 34px", fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>
                {t}
              </div>
            </Metal>
          ))}
        </div>
        <p style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 13, marginTop: 12 }}>
          Metal edge by default — hover a tile to fill it.
        </p>
      </div>

      {/* Buttons */}
      <section id="buttons">
        <div className="wrap">
          <p className="eyebrow">Component</p>
          <h2>Buttons</h2>
          <p>
            Readable at rest — a calm pill with a liquid-metal rim — then molten on hover. A sheen
            sweep and a real press. Four tones, three sizes. Pass <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>variant="fill"</code> for
            full chrome.
          </p>
          <div className="grid2">
            <div className="stage" style={{ flexDirection: "column", gap: 16 }}>
              <div className="row" style={{ justifyContent: "center" }}>
                <MetalButton tone="silver">Silver</MetalButton>
                <MetalButton tone="gold">Gold</MetalButton>
                <MetalButton tone="gunmetal">Gunmetal</MetalButton>
                <MetalButton tone="obsidian">Obsidian</MetalButton>
              </div>
              <div className="row" style={{ justifyContent: "center" }}>
                <MetalButton tone="silver" size="sm">Small</MetalButton>
                <MetalButton tone="silver" size="md">Medium</MetalButton>
                <MetalButton tone="silver" size="lg">Large</MetalButton>
              </div>
              <div className="row" style={{ justifyContent: "center" }}>
                <MetalButton tone="silver" variant="fill">Fill</MetalButton>
                <MetalButton tone="gold" variant="fill">Fill</MetalButton>
              </div>
            </div>
            <CodeBlock
              code={`import { MetalButton } from "argentui";
import "argentui/styles.css";

// readable pill, fills with metal on hover
<MetalButton tone="silver">Silver</MetalButton>
<MetalButton tone="gold" size="lg">Gold</MetalButton>

// full chrome
<MetalButton tone="silver" variant="fill">Fill</MetalButton>`}
            />
          </div>
        </div>
      </section>

      {/* Border styles */}
      <section id="styles">
        <div className="wrap">
          <p className="eyebrow">Variants</p>
          <h2>Border styles</h2>
          <p>
            Mix <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>frame</code> and{" "}
            <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>tint</code> for different
            framings — a single rim, a double frame with an inner hairline, or a tinted interior
            where the metal shows faintly through.
          </p>
          <div className="stage" style={{ gap: 18 }}>
            {[
              { label: "Single", props: {} },
              { label: "Double", props: { frame: "double" as const } },
              { label: "Tinted", props: { tint: true } },
              { label: "Double + tint", props: { frame: "double" as const, tint: true } },
              { label: "Thick rim", props: { borderWidth: 4 } },
            ].map((v) => (
              <MetalCard key={v.label} tone="silver" radius={16} style={{ width: 150 }} {...v.props}>
                <div style={{ padding: "26px 10px", textAlign: "center", fontWeight: 640, fontSize: 14 }}>
                  {v.label}
                </div>
              </MetalCard>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <CodeBlock
              code={`<MetalCard tone="silver" />                       // single
<MetalCard tone="silver" frame="double" />        // double frame
<MetalCard tone="silver" tint />                  // metal shows through
<MetalCard tone="silver" frame="double" tint />   // both
<MetalCard tone="silver" borderWidth={4} />       // thick rim`}
            />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section id="cards">
        <div className="wrap">
          <p className="eyebrow">Component</p>
          <h2>Cards</h2>
          <p>A padded liquid-metal panel — a metal edge by default. Hover it to fill with metal.</p>
          <div className="grid2">
            <div className="stage">
              <MetalCard tone="gunmetal" revealOnHover sheen style={{ maxWidth: 320 }}>
                <div style={{ fontSize: 17, fontWeight: 660, marginBottom: 6 }}>Forged in the browser</div>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.9, lineHeight: 1.5 }}>
                  The surface is Paper's LiquidMetal shader running edge-to-edge — true flowing
                  chrome, clipped to the card and dropped behind your content.
                </p>
              </MetalCard>
            </div>
            <CodeBlock
              code={`import { MetalCard } from "argentui";

// metal edge; fills with metal on hover
<MetalCard tone="gunmetal" revealOnHover sheen>
  <h3>Forged in the browser</h3>
  <p>Paper's LiquidMetal shader,
     clipped behind your content.</p>
</MetalCard>`}
            />
          </div>
        </div>
      </section>

      {/* Primitive */}
      <section id="primitive">
        <div className="wrap">
          <p className="eyebrow">Primitive</p>
          <h2>The Metal surface</h2>
          <p>
            <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>&lt;Metal&gt;</code> is the
            base every component is built on. Render any element with <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>as</code>,
            pick a tone, and choose <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>variant="border"</code> (default)
            or <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>"fill"</code> for the full molten surface.
          </p>
          <div className="grid2">
            <div className="stage">
              <Metal as="div" tone="gold" variant="fill" radius={24} sheen metalScale={1.4}>
                <div style={{ padding: 28, fontSize: 18, fontWeight: 700, maxWidth: 240, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
                  Full fill — molten gold.
                </div>
              </Metal>
            </div>
            <CodeBlock
              code={`import { Metal } from "argentui";

<Metal as="div" tone="gold"
  variant="fill" radius={24}
  metalScale={1.4} sheen>
  Full fill — molten gold.
</Metal>`}
            />
          </div>
        </div>
      </section>

      {/* Logo */}
      <section id="logo">
        <div className="wrap">
          <p className="eyebrow">Component</p>
          <h2>Liquid logos</h2>
          <p>
            Pour the metal into any mark — pass an image with a transparent background and it flows
            inside the silhouette. The classic liquid-metal treatment for logos and monograms.
          </p>
          <div className="grid2">
            <div className="stage">
              <MetalLogo src={LOGO_SRC} tone="silver" size={170} />
              <MetalLogo src={LOGO_SRC} tone="gold" size={170} />
            </div>
            <CodeBlock
              code={`import { MetalLogo } from "argentui";

<MetalLogo src="/logo.svg" tone="silver" size={170} />
<MetalLogo src="/logo.svg" tone="gold" size={170} />`}
            />
          </div>
        </div>
      </section>

      {/* Text */}
      <section id="text">
        <div className="wrap">
          <p className="eyebrow">Component</p>
          <h2>Metal type</h2>
          <p>
            Pass <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>shader</code> and the
            liquid metal pours into the letterforms — or set{" "}
            <code style={{ fontFamily: "var(--mono)", fontSize: 14 }}>variant="outline"</code> to
            run the metal around the edges over a dark or gradient interior. Without either you
            get the CSS chrome gradient (zero cost, any scale — the hero headline is the CSS mode).
          </p>
          <div className="grid2">
            <div className="stage" style={{ flexDirection: "column", gap: 14 }}>
              <MetalText shader tone="silver" fontSize={60}>Argent</MetalText>
              <MetalText shader variant="outline" tone="silver" fontSize={60} fillGradient={["#23262c", "#0a0b0d"]}>
                Argent
              </MetalText>
              <MetalText shader variant="outline" tone="gold" fontSize={60} fill="#141002">
                Argent
              </MetalText>
            </div>
            <CodeBlock
              code={`import { MetalText } from "argentui";

// metal floods the glyphs
<MetalText shader tone="silver">Argent</MetalText>

// metal edges, dark gradient inside
<MetalText shader variant="outline"
  fillGradient={["#23262c", "#0a0b0d"]}>
  Argent
</MetalText>

// CSS chrome gradient — free, any scale
<MetalText tone="gunmetal">Quicksilver</MetalText>`}
            />
          </div>
        </div>
      </section>

      {/* Controls */}
      <section id="controls">
        <div className="wrap">
          <p className="eyebrow">Components</p>
          <h2>Controls</h2>
          <p>
            A mercury switch — the thumb is a drop of liquid metal that squishes as you press it — a
            molten progress bar, and metal-rimmed badges.
          </p>
          <div className="grid2">
            <div className="stage" style={{ flexDirection: "column", gap: 22 }}>
              <div className="row" style={{ justifyContent: "center" }}>
                <MetalToggle tone="silver" defaultChecked />
                <MetalToggle tone="gold" />
                <MetalToggle tone="gunmetal" defaultChecked />
              </div>
              <ProgressDemo />
              <MetalProgress tone="gold" style={{ width: 260 }} />
              <div className="row" style={{ justifyContent: "center" }}>
                <MetalBadge tone="silver">v0.2.0</MetalBadge>
                <MetalBadge tone="gold">Pro</MetalBadge>
                <MetalBadge tone="gunmetal" tint>Beta</MetalBadge>
              </div>
            </div>
            <CodeBlock
              code={`import { MetalToggle, MetalProgress, MetalBadge } from "argentui";

<MetalToggle tone="silver" defaultChecked
  onCheckedChange={setEnabled} />

<MetalProgress tone="silver" value={64} />
<MetalProgress tone="gold" />  {/* indeterminate */}

<MetalBadge tone="gold">Pro</MetalBadge>`}
            />
          </div>
        </div>
      </section>

      {/* Lab */}
      <section id="lab">
        <div className="wrap">
          <p className="eyebrow">Interactive</p>
          <h2>Metal Lab</h2>
          <p>Tune the finish, radius, ripple, and sheen — the code updates as you go.</p>
          <MetalLab />
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap frow">
          <div>
            <div style={{ color: "var(--ink-2)", fontWeight: 600 }}>Argent</div>
            <div className="muted">Liquid-metal UI for React. MIT.</div>
          </div>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            <a href="https://www.npmjs.com/package/argentui">npm i argentui</a>
            <a href="https://github.com/seangeng/argent">GitHub</a>
            <a href="https://seangeng.com/writing/building-a-liquid-metal-ui-kit">The writeup</a>
            <a href="https://glaceui.com">Glacé (glass sibling)</a>
            <a href="https://seangeng.com">Built by Sean Geng</a>
          </div>
        </div>
      </footer>
    </>
  );
}
