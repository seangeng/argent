import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
const DIST = new URL("../dist", import.meta.url).pathname;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const server = createServer((req, res) => {
  const path = req.url.split("?")[0];
  let file = join(DIST, path);
  if (!existsSync(file) || path === "/") file = join(DIST, "index.html");
  res.setHeader("content-type", MIME[extname(file)] ?? "application/octet-stream");
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4317, r));
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:4317/");
await page.waitForTimeout(1500);
const el = page.locator("#icons .playground").first();
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(2800); // staggered shader mounts
await el.screenshot({ path: "/tmp/argent-ux/icons-shader-default.png" });
const info = await page.evaluate(() => {
  let lost = 0; const cs=[...document.querySelectorAll('#icons canvas')];
  cs.forEach(c=>{const gl=c.getContext('webgl2')||c.getContext('webgl');if(gl&&gl.isContextLost&&gl.isContextLost())lost++;});
  return { iconCanvases: cs.length, lost, cssIconSpans: document.querySelectorAll('.argent-icon').length, btnIcon: !!document.querySelector('.argent-btn-icon svg') };
});
console.log("✓", JSON.stringify(info));
await browser.close(); server.close();
