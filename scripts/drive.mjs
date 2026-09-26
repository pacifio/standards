/**
 * Drives the shell in a real browser and asserts the behaviours a screenshot
 * cannot: the rail collapses without losing its rows, the active pill slides
 * rather than jumps, ScrollFade only fades the edge with more content, and
 * the GLSL login aside mounts client-only with no hydration error.
 *
 *   bun scripts/drive.mjs
 *
 * Requires `bun run dev` on port 3000. Exits non-zero on the first failure.
 */
import { chromium } from "playwright-core"

const EXE =
  "/Users/adib/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"

const browser = await chromium.launch({ executablePath: EXE })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
page.on("pageerror", (e) => errs.push(e.message))
page.on("console", (m) => m.type() === "error" && errs.push(m.text()))

let failures = 0
function check(name, ok, detail = "") {
  console.log(
    (ok ? "ok  " : "FAIL") + " " + name + (detail ? " — " + detail : "")
  )
  if (!ok) failures++
}

// 1. Rail collapse keeps every row.
await page.goto("http://localhost:3000/mock/timeline", {
  waitUntil: "networkidle",
})
const rows = async () => page.locator('[data-slot="sidebar"] li').count()
const before = await rows()
await page.keyboard.press("Meta+.")
await page.waitForTimeout(600)
const collapsedWidth = await page
  .locator('[data-slot="sidebar"]')
  .evaluate((el) => el.getBoundingClientRect().width)
const after = await rows()
check(
  "rail collapses to 52px",
  Math.round(collapsedWidth) === 52,
  `${collapsedWidth}px`
)
check(
  "rail keeps its rows when collapsed",
  before === after,
  `${before} → ${after}`
)
await page.keyboard.press("Meta+.")
await page.waitForTimeout(600)

// 2. The active pill slides: sample its position every frame for 400ms.
const pill = () => page.locator('[data-slot="sidebar-pill"]').first()
const y0 = await pill().evaluate((el) => el.getBoundingClientRect().top)
const traj = await page.evaluate(async () => {
  const link = document.querySelector('[data-slot="sidebar"] a[href="/mock/inbox"]')
  link.click()
  const ys = []
  const t0 = performance.now()
  while (performance.now() - t0 < 400) {
    await new Promise((r) => requestAnimationFrame(r))
    const el = document.querySelector('[data-slot="sidebar-pill"]')
    ys.push(el ? Math.round(el.getBoundingClientRect().top) : null)
  }
  return ys
})
const distinct = [...new Set(traj.filter((y) => y !== null))]
check(
  "active pill slides between rows",
  distinct.length > 3,
  `${y0} → ${distinct.slice(0, 8).join(",")}… (${distinct.length} positions)`
)
await page.waitForTimeout(300)

// 3. ScrollFade fades only the edge with more content.
await page.goto("http://localhost:3000/mock/chat", { waitUntil: "networkidle" })
const fade = page.locator('[data-slot="scroll-fade"]').nth(1)
const fadesAtTop = await fade.evaluate((el) => {
  el.scrollTop = 0
  return new Promise((r) =>
    setTimeout(
      () =>
        r([
          getComputedStyle(el).getPropertyValue("--fade-top"),
          getComputedStyle(el).getPropertyValue("--fade-bottom"),
        ]),
      250
    )
  )
})
check(
  "scroll-fade at top: no top fade",
  parseFloat(fadesAtTop[0]) === 0,
  fadesAtTop.join(" / ")
)

// 4. Login: server renders the DitherField fallback, client mounts the shader.
const ssr = await (await fetch("http://localhost:3000/mock/login")).text()
check(
  "login SSR renders the dither fallback",
  ssr.includes('data-slot="dither-field"')
)
check("login SSR does not inline three", !ssr.includes("shaderMaterial"))
await page.goto("http://localhost:3000/mock/login", {
  waitUntil: "networkidle",
})
await page.waitForTimeout(1200)
const canvases = await page.locator("aside canvas").count()
check(
  "login mounts a WebGL canvas on the client",
  canvases >= 1,
  `${canvases} canvas`
)

check(
  "no console or runtime errors",
  errs.length === 0,
  errs.slice(0, 3).join(" | ")
)
await browser.close()
process.exit(failures ? 1 : 0)
