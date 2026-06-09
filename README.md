# Argent

**Liquid-metal UI for React.** Flowing chrome, gold, and gunmetal surfaces that ripple like mercury — real liquid metal, powered by [Paper's `LiquidMetal` WebGL shader](https://shaders.paper.design/liquid-metal), wrapped in components. A metal sibling to [Glacé](https://glaceui.com).

```bash
npm i argentui @paper-design/shaders-react
```

> `@paper-design/shaders-react` is a **peer dependency** — install it alongside `argentui`. It's the WebGL shader engine, by [Paper](https://paper.design), licensed under PolyForm Shield.

```tsx
import { MetalButton, MetalCard, Metal } from "argentui";
import "argentui/styles.css";

<MetalButton tone="silver">Get started</MetalButton>
<MetalCard tone="gunmetal" sheen>Forged in the browser</MetalCard>
```

## How it works

Each surface renders Paper's `LiquidMetal` shader with `shape="none"` so the metal fills the whole element instead of painting a blob. The shader canvas sits behind your content, clipped to the surface's radius. A tone is just a tuned set of shader params (`colorBack`, `colorTint`, `repetition`, `distortion`, `shiftRed/Blue`, …). Until the canvas mounts on the client, a static CSS gradient stands in (SSR-safe).

Each surface is its own WebGL canvas, and browsers cap concurrent WebGL contexts (~16). Argent handles this for you: the shader only mounts while a surface is on/near screen (IntersectionObserver) and releases its context when it scrolls away, so a long page stays well under the cap. The static gradient shows in the meantime.

By default the metal is just the **edge** (`variant="border"`) with a calm interior, which keeps content readable; pass `variant="fill"` for a full molten surface, or `revealOnHover` to fill in on interaction.

## Components

### `<MetalButton>`
A stamped-metal button: a flowing shader finish, a sheen sweep on hover, a real press.

```tsx
<MetalButton tone="gold" size="lg">Buy</MetalButton>
```

| prop | type | default |
|------|------|---------|
| `tone` | `"silver" \| "gold" \| "gunmetal" \| "obsidian"` | `"silver"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `speed` | `number` | `1` |

### `<MetalCard>`
A padded liquid-metal panel.

```tsx
<MetalCard tone="gunmetal" sheen>
  <h3>Title</h3>
  <p>Any content — the metal flows behind it.</p>
</MetalCard>
```

### `<Metal>`
The base primitive every component is built on. Render any element via `as`.

```tsx
<Metal as="nav" tone="silver" radius={16} speed={0.5} sheen>…</Metal>
```

| prop | type | default | notes |
|------|------|---------|-------|
| `as` | `ElementType` | `"div"` | element/component to render |
| `tone` | `MetalTone` | `"silver"` | finish (silver/gold/gunmetal/obsidian) |
| `variant` | `"border" \| "fill"` | `"border"` | metal edge only, or full surface |
| `frame` | `"single" \| "double"` | `"single"` | double adds an inner hairline frame |
| `tint` | `boolean` | `false` | let the metal show faintly through the interior |
| `revealOnHover` | `boolean` | `false` | fill with metal on hover (border variant) |
| `borderWidth` | `number` | `1.5` | rim thickness (border variant) |
| `radius` | `number` | `14` | corner radius (px) |
| `speed` | `number` | `1` | shader speed (`0` pauses) |
| `metalScale` | `number` | `1.1` | pattern scale — higher spreads the bands |
| `sheen` | `boolean` | `false` | specular streak on hover |

Theme the border interior with the `--argent-panel` CSS variable.

Tune any tone with `TONE_PARAMS`, or drop down to `<MetalFill>` / Paper's `<LiquidMetal>` directly for full control.

## Credits

Liquid-metal shader by [Paper](https://shaders.paper.design/liquid-metal) (`@paper-design/shaders`). Argent is the component layer, motion, and theming on top.

## License

MIT © [Sean Geng](https://seangeng.com). The bundled shader engine (`@paper-design/shaders-react`, a peer dependency) is licensed separately under PolyForm Shield by Paper.
