/**
 * Screenshots the gallery and the mock, for reviewing a change without
 * clicking through 21 routes.
 *
 *   bun scripts/screenshot.mjs /mock/timeline "/mock/inbox#light" "/ds/patterns#dark#390#844"
 *
 * Each target is `route[#theme[#width[#height]]]`. Output lands in /tmp/shots.
 * Exits non-zero if any page logged a console or runtime error, so it doubles
 * as a smoke test. Requires `bun run dev` on port 3000 and the Playwright
 * Chromium build already in the ms-playwright cache.
 */
import { chromium } from "playwright-core"

const EXE =
  "/Users/adib/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"

const targets = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: EXE })
let failed = 0
for (const t of targets) {
  const [route, theme = "dark", w = "1440", h = "900"] = t.split("#")
  const page = await browser.newPage({
    viewport: { width: +w, height: +h },
    deviceScaleFactor: 2,
  })
  const errs = []
  page.on("pageerror", (e) => errs.push(e.message))
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()))
  await page.addInitScript((tt) => localStorage.setItem("atlas-theme", tt), theme)
  await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  const name = route.replace(/\//g, "_").replace(/^_/, "") + "-" + theme + "-" + w
  await page.screenshot({ path: `/tmp/shots/${name}.png` })
  if (errs.length) { failed++; console.log("ERR", name, errs.slice(0, 3)) }
  else console.log("ok ", name)
  await page.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
