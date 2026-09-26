/**
 * Screenshots the gallery and the mock, for reviewing a change without
 * clicking through 21 routes.
 *
 *   bun scripts/screenshot.mjs /mock/timeline "/mock/inbox#light" "/ds/patterns#dark#390#844" "/mock/timeline#dark#1440#900#scale=1.3"
 *
 * Each target is `route[#theme[#width[#height]][#scale=N]]`; the scale segment
 * seeds `--ui-scale` so density scaling is screenshot-verified too. Output
 * lands in /tmp/shots.
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
  const parts = t.split("#")
  const scale = parts.find((p) => p.startsWith("scale="))?.slice(6) ?? "1"
  const [route, theme = "dark", w = "1440", h = "900"] = parts.filter(
    (p) => !p.startsWith("scale=")
  )
  const page = await browser.newPage({
    viewport: { width: +w, height: +h },
    deviceScaleFactor: 2,
  })
  const errs = []
  page.on("pageerror", (e) => errs.push(e.message))
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()))
  await page.addInitScript(
    ([tt, sc]) => {
      localStorage.setItem("atlas-theme", tt)
      localStorage.setItem("atlas-ui-scale", sc)
    },
    [theme, scale]
  )
  await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  const name =
    route.replace(/\//g, "_").replace(/^_/, "") +
    "-" +
    theme +
    "-" +
    w +
    (scale !== "1" ? "-x" + scale : "")
  await page.screenshot({ path: `/tmp/shots/${name}.png` })
  if (errs.length) {
    failed++
    console.log("ERR", name, errs.slice(0, 3))
  } else console.log("ok ", name)
  await page.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
