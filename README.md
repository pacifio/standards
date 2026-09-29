# Atlas Standards

The UI design system for the Atlas web app — and a mock of that app built on
it.

**Achromatic surfaces, hairline rules, rings instead of shadows, and hue only
where something has an identity.** The structure — a glass topbar, a
spring-collapsing sidebar whose active pill slides between rows, ringed
panels, a KPI strip, hue-coded tags, an interface-scale control — comes from
the Auberge dashboard. The palette and the illustration blocks — a monochrome
OKLCH ramp, dashed rails, cross-hair corners, the Bayer-dither shader — come
from natai. What is Atlas's own: the session-shaped blocks, the fixtures, and
the ratchet that keeps the two from drifting apart.

```bash
bun install
bun dev          # http://localhost:3000
bun test         # the design-system ratchet
bun run typecheck
bun run lint
bun run check    # prettier
```

## What is here

| Route | What it is |
|---|---|
| `/ds/foundations/*` | Colour, type, density, motion & depth — every token with its value and the reason it exists |
| `/ds/components/*` | 36 components: actions, forms, overlays, data, feedback. Every variant, size and state |
| `/ds/patterns` | Panel, KPI strip, segmented controls, data table, setting card — the compositions that appear on more than one screen |
| `/ds/blocks` | The illustration and effect primitives, including the GLSL reveal-wave image |
| `/mock/*` | The Atlas web app: Inbox, Timeline, Projects, Chat, Settings, Admin, Sign in |

Both themes are fully designed; dark is the default. Toggle from the sidebar
footer or the gallery nav. The interface scale (`T 100%`) lives beside it.

## Shape

```
src/styles/     tokens.css    non-colour scales: rem type, control ladder, radius, layout, motion, z
                themes.css    dark (:root) and light ([data-theme="light"]) — all OKLCH
                globals.css   the @theme inline bridge to Tailwind, @property, base layer
                utilities.css the named vocabulary: micro, figure, tag-*, glass, scroll-fade…
src/components/ ui/           36 primitives on @base-ui/react, shadcn base-mira shape
                patterns/     Panel, KpiStrip, Segmented, DataTable, SettingCard, headers
                blocks/       ProgressiveBlur, InfiniteSlider, DashedRails, PlusDecorator,
                              GhostCards, Glow, SpinningBorderPill, SessionPipeline,
                              SessionTimeline, RevealWaveImage, Globe
                shell/        AppShell, Sidebar, TopBar, OrgSwitcher, CommandMenu,
                              SettingsShell, AuthSplit, UiScaleControl
                gallery/      the gallery's own furniture
src/lib/        theme.tsx, ui-scale.tsx, org-context.tsx, hue.ts, motion.ts,
                resolved-color.ts, use-measure.ts
src/mock/       fixtures typed against the real server API shapes
scripts/        screenshot.mjs — smoke test + screenshots across every route
tests/          the ratchet
```

## The rules, in one screen

- **Everything is OKLCH and almost everything has zero chroma.** Six surface
  steps in dark — page `0.08`, surface `0.10`, card `0.12`, illustration
  `0.13`, muted `0.15`, popover `0.17` — each one lighter than the last. In
  light the ramp saturates at white after the card and hierarchy is carried by
  the ring. The token layer is the only place a colour literal may appear.
- **The primary is the foreground, inverted.** No brand hue in the chrome.
  Focus is the foreground at 40%, selection at 22%.
- **Two rules, not one.** `--hairline` (6–7%) for a rule *inside* content,
  `--border` (8–9%) for the edge of a thing, `--border-strong` for focus.
- **Rings, not shadows.** A raised block is `rounded-xl bg-card ring-1
  ring-foreground/10`. Only a menu (`shadow-md`) and a dialog (`shadow-lg`)
  cast, because they float over content they are not part of.
- **Chroma has exactly two jobs.** Four status inks (success / warning /
  error / info) with `-muted` fills, and eight hues for *identity* — labels,
  projects, roles — via `.tag-<hue>` and `hueFor(id)`. Done is an achromatic
  check, not a colour.
- **Rem on a 16px root × `--ui-scale`.** `--spacing` is Tailwind's `0.25rem`;
  the type scale runs 9 → 28px in nine rem steps with the body default at
  12px; controls are 20 / 24 / 28 / 32 / 36 with 28 the default. The scale
  control (0.9–1.4, ⌘⌥= / ⌘⌥- / ⌘⌥0) grows all of it together.
- **Geist, three weights.** 400 for text, 500 for emphasis, 300 for
  `.figure` only — the light hero numbers in a KPI strip. Nothing heavier.
  Geist Mono for code, refs and identifiers.
- **Buttons are pills.** `rounded-full` at every size with a 99% press scale.
  Everything you press is round; everything that contains is `rounded-xl`.
- **Springs for things that move, one ease for things that appear.**
  `SPRING_RAIL` 420/40, `SPRING_DOCK` 380/40, `SPRING_INDICATOR` 520/38,
  `SPRING_PILL` 560/42, `EASE_PANEL [0.22, 1, 0.36, 1]`, panels staggering in
  50ms apart. CSS durations for hover and menus. No overshoot.
- **Scrollbars are hidden everywhere** and scroll regions fade their edges
  with a mask that measures itself (`ScrollFade`, on `@property`).
- **Nine named z-layers.** Nothing writes a number. `popover` sits above
  `modal` on purpose.

All of it is enforced by `tests/design-system-ratchet.test.ts` — thirteen
rules held at zero, including OKLCH and `color-mix` literals in components,
raised shadows, `[var(--…)]` escapes, stock Tailwind ramps, arbitrary type
sizes and bare z-indexes.

## Porting it into the real app

See [PORTING.md](./PORTING.md).

## Screenshots

```bash
bun scripts/screenshot.mjs /mock/timeline "/mock/inbox#light" "/mock/timeline#dark#1440#900#scale=1.3"
```

Writes to `/tmp/shots`, and exits non-zero if any page logged an error — so it
doubles as a smoke test across every route. The `scale=` segment seeds
`--ui-scale` so density scaling is checked too.
