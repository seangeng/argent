# Argent

**Liquid-metal UI for React.** Flowing chrome, gold, and gunmetal surfaces that ripple like mercury — built with pure CSS + SVG. No WebGL, no canvas, SSR-safe. A metal sibling to [Glacé](https://glaceui.com).

```bash
npm i argentui
```

```tsx
import { MetalButton, MetalCard, Metal } from "argentui";
import "argentui/styles.css";

<MetalButton tone="silver">Get started</MetalButton>
<MetalCard tone="gunmetal" sheen>Forged in the browser</MetalCard>
```

## How it works

A metallic surface is a multi-stop **chrome gradient** (light→dark→light banding — the thing your eye reads as polished reflective metal) that flows under a single global **SVG displacement filter** (`feTurbulence` + `feDisplacementMap`) which warps it like mercury. The filter is mounted once and warps each surface's own gradient, so it's size- and backdrop-independent. Where SVG filters aren't available the surface degrades to the (still good-looking) animated gradient alone.

No images, no WebGL, no canvas — just CSS and one SVG filter.

## Components

### `<MetalButton>`
A stamped-metal button: flowing finish, a sheen sweep on hover, a real press.

```tsx
<MetalButton tone="gold" size="lg" liquid="flow">Buy</MetalButton>
```

| prop | type | default |
|------|------|---------|
| `tone` | `"silver" \| "gold" \| "gunmetal" \| "obsidian"` | `"silver"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `liquid` | `"ripple" \| "flow" \| false` | `"ripple"` |

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
<Metal as="nav" tone="silver" radius={16} liquid="ripple" sheen>…</Metal>
```

| prop | type | default | notes |
|------|------|---------|-------|
| `as` | `ElementType` | `"div"` | element/component to render |
| `tone` | `MetalTone` | `"silver"` | finish |
| `radius` | `number` | `14` | corner radius (px) |
| `liquid` | `"ripple" \| "flow" \| false` | `"ripple"` | ripple strength |
| `sheen` | `boolean` | `false` | specular streak on hover |

## License

MIT © [Sean Geng](https://seangeng.com)
