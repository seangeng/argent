// Capture marketing/README screenshots from the built site with a real
// (software-GL) browser so the WebGL shaders render. Run: node scripts/shots.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const DIST = new URL("../dist", import.meta.url).pathname;
const OUT = new URL("../../assets", import.meta.url).pathname;
const OG = new URL("../public/shots", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
mkdirSync(OG, { recursive: true });

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const path = req.url.split("?")[0];
  let file = join(DIST, path);
  if (!existsSync(file) || path === "/") file = join(DIST, "index.html");
  res.setHeader("content-type", MIME[extname(file)] ?? "application/octet-stream");
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4311, r));

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:4311/");
await page.waitForTimeout(3000);

async function shot(selector, file, pad = 0) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400); // let gated shaders mount + settle
  if (pad) {
    const box = await el.boundingBox();
    await page.screenshot({
      path: file,
      clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(1440, box.width + pad * 2), height: box.height + pad * 2 },
    });
  } else {
    await el.screenshot({ path: file });
  }
  console.log("✓", file);
}

// hero (full top of page) — also the OG image
await page.screenshot({ path: `${OUT}/hero.png`, clip: { x: 0, y: 0, width: 1440, height: 880 } });
console.log("✓ hero");
await page.screenshot({ path: `${OG}/hero.png`, clip: { x: 0, y: 0, width: 1440, height: 756 } });

await shot("#buttons .stage", `${OUT}/buttons.png`);
await shot("#styles .stage", `${OUT}/styles.png`);
await shot("#primitive .stage", `${OUT}/effects.png`);

// swap the logo lab to a real brand mark before capturing
await page.locator("#logo .seg button", { hasText: /^GitHub$/ }).click();
await page.waitForTimeout(2200);
await shot("#logo .stage", `${OUT}/logos.png`);
await shot("#text .stage", `${OUT}/text.png`);
await shot("#controls .stage", `${OUT}/controls.png`);
await shot("#lab .playground", `${OUT}/lab.png`);

// flip the lab to the native engine and capture it for A/B review
await page.locator("#lab .seg button", { hasText: /^native$/ }).click();
await page.waitForTimeout(1500);
await shot(".lab-stage", `${OUT}/native.png`);

// sanity: count canvases + lost contexts at the end
const stats = await page.evaluate(() => {
  let lost = 0;
  const cs = [...document.querySelectorAll("canvas")];
  cs.forEach((c) => {
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (gl && gl.isContextLost && gl.isContextLost()) lost++;
  });
  return { canvases: cs.length, lost };
});
console.log("stats", stats);

await browser.close();
server.close();
