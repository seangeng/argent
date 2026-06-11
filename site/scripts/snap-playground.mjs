
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
const DIST = "/Users/seangeng/Documents/argent/site/dist";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const server = createServer((req, res) => {
  const path = req.url.split("?")[0];
  let file = join(DIST, path);
  if (!existsSync(file) || path === "/") file = join(DIST, "index.html");
  res.setHeader("content-type", MIME[extname(file)] ?? "application/octet-stream");
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4314, r));
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:4314/");
await page.waitForTimeout(2500);
for (const [sel, name] of [["#text .playground", "pg-text"], ["#primitive .playground", "pg-effects"], ["#lab .playground", "pg-lab"]]) {
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await el.screenshot({ path: `/tmp/argent-ux/${name}.png` });
  console.log("✓", name);
}
await browser.close();
server.close();
