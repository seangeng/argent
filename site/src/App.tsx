import { useState } from "react";
import { Metal, MetalCard, MetalButton, type MetalTone } from "argentui";
import { CodeBlock } from "./CodeBlock";
import { MetalLab } from "./MetalLab";

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
              <a href="#cards">Cards</a>
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
            Liquid <span className="liq">metal</span>
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
            <Metal key={t} tone={t} radius={18} sheen>
              <div style={{ padding: "30px 34px", fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", textShadow: "0 1px 6px rgba(0,0,0,0.45), 0 0 1px rgba(255,255,255,0.6)" }}>
                {t}
              </div>
            </Metal>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <section id="buttons">
        <div className="wrap">
          <p className="eyebrow">Component</p>
          <h2>Buttons</h2>
          <p>
            A stamped-metal button: flowing finish, a sheen that sweeps on hover, and a real press.
            Four tones, three sizes.
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
            </div>
            <CodeBlock
              code={`import { MetalButton } from "argentui";
import "argentui/styles.css";

<MetalButton tone="silver">Silver</MetalButton>
<MetalButton tone="gold" size="lg">Gold</MetalButton>
<MetalButton tone="gunmetal" size="lg">Gunmetal</MetalButton>`}
            />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section id="cards">
        <div className="wrap">
          <p className="eyebrow">Component</p>
          <h2>Cards</h2>
          <p>A padded liquid-metal panel. Drop any content inside; the metal flows behind it.</p>
          <div className="grid2">
            <div className="stage">
              <MetalCard tone="gunmetal" sheen style={{ maxWidth: 320 }}>
                <div style={{ fontSize: 17, fontWeight: 660, marginBottom: 6 }}>Forged in the browser</div>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.9, lineHeight: 1.5 }}>
                  The surface is Paper's LiquidMetal shader running edge-to-edge — true flowing
                  chrome, clipped to the card and dropped behind your content.
                </p>
              </MetalCard>
            </div>
            <CodeBlock
              code={`import { MetalCard } from "argentui";

<MetalCard tone="gunmetal" sheen>
  <h3>Forged in the browser</h3>
  <p>The surface is an animated chrome
     gradient rippled by SVG.</p>
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
            pick a tone, dial the ripple, and wrap whatever you like.
          </p>
          <div className="grid2">
            <div className="stage">
              <Metal as="div" tone="gold" radius={24} sheen metalScale={1.4}>
                <div style={{ padding: 28, fontSize: 18, fontWeight: 660, maxWidth: 240 }}>
                  Any element, any shape — molten gold.
                </div>
              </Metal>
            </div>
            <CodeBlock
              code={`import { Metal } from "argentui";

<Metal as="div" tone="gold"
  radius={24} metalScale={1.4} sheen>
  Any element, any shape.
</Metal>`}
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
            <a href="https://glaceui.com">Glacé (glass sibling)</a>
            <a href="https://seangeng.com">Built by Sean Geng</a>
          </div>
        </div>
      </footer>
    </>
  );
}
