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
await new Promise((r) => server.listen(4316, r));
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:4316/");
await page.waitForTimeout(1500);
const el = page.locator("#icons .playground").first();
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await el.screenshot({ path: "/tmp/argent-ux/icons-css.png" });
console.log("✓ css mode");
// flip to shader
await page.locator("#icons .seg button", { hasText: /^shader$/ }).click();
await page.waitForTimeout(2200);
await el.screenshot({ path: "/tmp/argent-ux/icons-shader.png" });
console.log("✓ shader mode");
// sanity: are the masked icon spans real?
const info = await page.evaluate(() => {
  const css = [...document.querySelectorAll(".argent-icon")];
  const sample = css[0] && getComputedStyle(css[0]);
  return { cssIcons: css.length, hasMask: sample ? (sample.maskImage||sample.webkitMaskImage||"").slice(0,30) : null, btnIcon: !!document.querySelector(".argent-btn-icon svg") };
});
console.log(JSON.stringify(info));
await browser.close(); server.close();
