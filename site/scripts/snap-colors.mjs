import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
const DIST = new URL("../dist", import.meta.url).pathname;
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css" };
const server = createServer((req,res)=>{const p=req.url.split("?")[0];let f=join(DIST,p);if(!existsSync(f)||p==="/")f=join(DIST,"index.html");res.setHeader("content-type",MIME[extname(f)]??"application/octet-stream");res.end(readFileSync(f));});
await new Promise(r=>server.listen(4318,r));
const b = await chromium.launch({ args:["--enable-unsafe-swiftshader"] });
const page = await b.newPage({ viewport:{width:1100,height:900}, deviceScaleFactor:2 });
await page.goto("http://localhost:4318/");
await page.waitForTimeout(1500);
// showcase = first .stage on the page (the 8 tone tiles)
const stage = page.locator(".hero ~ .stage, .wrap > .stage").first();
await stage.scrollIntoViewIfNeeded();
await page.waitForTimeout(2600);
await stage.screenshot({ path:"/tmp/argent-ux/colors-showcase.png" });
console.log("✓ showcase");
// effects demo: pick crimson, then amethyst
const fx = page.locator("#primitive .playground").first();
await fx.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.locator("#primitive .seg button", { hasText:/^crimson$/ }).click();
await page.waitForTimeout(1800);
await fx.screenshot({ path:"/tmp/argent-ux/colors-effects.png" });
console.log("✓ effects crimson");
await b.close(); server.close();
