// Rapid font-toggle consistency + new control layout
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";

const DIST = new URL("../dist", import.meta.url).pathname;
const OUT = "/tmp/argent-ux";
mkdirSync(OUT, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const path = req.url.split("?")[0];
  let file = join(DIST, path);
  if (!existsSync(file) || path === "/") file = join(DIST, "index.html");
  res.setHeader("content-type", MIME[extname(file)] ?? "application/octet-stream");
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4313, r));

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:4313/");
await page.waitForTimeout(2500);

const textStage = page.locator("#text .stage").first();
await textStage.scrollIntoViewIfNeeded();
await page.waitForTimeout(2500); // initial Playfair load

// RAPID toggling: Bebas -> Pacifico -> Oswald in quick succession
for (const f of ["Bebas Neue", "Pacifico", "Oswald"]) {
  await page.locator("#text .font-chip", { hasText: f }).click();
  await page.waitForTimeout(150);
}
await page.waitForTimeout(3000); // settle — must show Oswald
await textStage.screenshot({ path: `${OUT}/rapid-oswald.png` });
console.log("✓ rapid-oswald.png");

// then one calm switch to Pacifico (script face — unmistakable)
await page.locator("#text .font-chip", { hasText: "Pacifico" }).click();
await page.waitForTimeout(2600);
await textStage.screenshot({ path: `${OUT}/calm-pacifico.png` });
console.log("✓ calm-pacifico.png");

// layout check: effects + logo rows
const fx = page.locator("#primitive .stage").first();
await fx.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await fx.screenshot({ path: `${OUT}/effects-rows.png` });
console.log("✓ effects-rows.png");

await browser.close();
server.close();
