// Interaction verification: do the lab controls actually switch the demos?
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const DIST = new URL("../dist", import.meta.url).pathname;
const OUT = "/tmp/argent-ux";
import { mkdirSync } from "node:fs";
mkdirSync(OUT, { recursive: true });

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const path = req.url.split("?")[0];
  let file = join(DIST, path);
  if (!existsSync(file) || path === "/") file = join(DIST, "index.html");
  res.setHeader("content-type", MIME[extname(file)] ?? "application/octet-stream");
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4312, r));

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:4312/");
await page.waitForTimeout(2500);

async function snap(sel, file, settle = 1200) {
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(settle);
  await el.screenshot({ path: `${OUT}/${file}` });
  console.log("✓", file);
}

// 1) effects: switch to chrome, then ripple — should change instantly, no remount
await page.locator("#primitive .seg button", { hasText: /^chrome$/ }).click();
await snap("#primitive .stage", "effects-chrome.png", 900);
await page.locator("#primitive .seg button", { hasText: /^silver$/ }).click();
await snap("#primitive .stage", "effects-chrome-silver.png", 900);

// 2) logo: Apple in gold
await page.locator("#logo .seg button", { hasText: /^Apple$/ }).click();
await page.locator("#logo .seg button", { hasText: /^gold$/ }).click();
await snap("#logo .stage", "logo-apple-gold.png", 2200);

// 3) text: type new text (live debounce), switch tone
await page.locator("#text .text-input").fill("Mercury");
await page.locator("#text .seg button", { hasText: /^gold$/ }).click();
await snap("#text .stage", "text-mercury-gold.png", 2600);

// 4) toggles: click silver off, gold on — capture state change
await page.locator("#controls .argent-toggle").first().scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.locator("#controls .argent-toggle").nth(1).click(); // gold ON
await page.locator("#controls .argent-toggle").nth(0).click(); // silver OFF
await snap("#controls .stage", "toggles-switched.png", 800);

// timing check: effect switch latency (canvas param change, no remount)
const t0 = Date.now();
await page.locator("#primitive .seg button", { hasText: /^molten$/ }).click();
await page.waitForTimeout(50);
const sameCanvas = await page.evaluate(() => !!document.querySelector("#primitive .stage canvas"));
console.log("effect switch: canvas still mounted after click:", sameCanvas, `(${Date.now() - t0}ms)`);

await browser.close();
server.close();
