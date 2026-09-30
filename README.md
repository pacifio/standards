# Atlas Standards

The UI design system for the Atlas web app — and a high-fidelity mock of that
app built on it.

**Achromatic surfaces, hairline rules, rings instead of shadows, and hue only
where something has an identity.** The structure: curved panels set into a
canvas frame, a spring-collapsing sidebar whose active pill slides between
rows, a side dock that opens beside the page, ringed panels, hue-coded tags and
an interface-scale control. The palette and the illustration blocks: a
monochrome OKLCH ramp, dashed rails, dotted and ruled fields, the Bayer-dither
shader, a draggable status globe. Around them sit the session-shaped blocks,
the fixtures, and the ratchet that keeps the system from drifting.

```bash
bun install
bun dev          # http://localhost:3000
bun test         # the design-system ratchet
bun run typecheck
bun run lint
bun run check    # prettier
```

## What is here

| Route               | What it is                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/`                 | The front door: the two halves, on a dashed-rail field                                                                        |
| `/ds/foundations/*` | Colour, type, density, motion & depth — every token with its value and the reason it exists                                   |
| `/ds/components/*`  | Actions, forms, overlays, data, feedback. Every variant, size and state                                                       |
| `/ds/patterns`      | Panel, KPI strip, segmented controls, data table, setting card — the compositions that appear on more than one screen         |
| `/ds/blocks`        | The illustration and effect primitives, including the draggable status globe                                                  |
| `/mock/*`           | The Atlas web app, inside the app shell: Dashboard, Inbox, Timeline, Projects, Chat, Spaces, Admin, plus Settings and Sign in |
| `/mock/s/:id`       | A session on its own page — the public link a share hands out. No app shell; guests can comment if the link allows it         |

Both themes are fully designed; dark is the default. Toggle from the sidebar
footer or the gallery nav. The interface scale (`T 100%`) lives beside it.

### The mock, screen by screen

- **Dashboard** — a greeting, a stat strip of dot-matrix charts with coloured
  trends, token-share meters, an activity feed, a members card with an
  animated avatar stack and an invite popover, recent sessions.
- **Inbox** — one day-grouped list (sticky day headers with the day's updates
  and faces), multi-line rows, mark-all-read.
- **Timeline** — sessions grouped by day. A row opens the **session reader** in
  the dock (compact or half width): masthead, stat grid with a context meter,
  the entry rail (prompt, tool calls with diffs, responses, checkpoints),
  inline comment threads, and a floating bar whose buttons grow into a share
  panel and a comments panel. The ↗ in its header opens the public page.
- **Projects** — the project grid. The floating **+** opens a three-step bottom
  sheet (name → details → review) that animates between steps and creates the
  project.
- **Chat** — three panels: the conversation list (active now, channels, direct
  messages, discover; "+" menus for a channel or a group), a linear
  Slack-style transcript with reactions, replies and pins, the composer, and an
  **Assets** dock with prompt drafts (a shared editor with a live
  collaborator's caret) and files. Both side panels fold away.
- **Spaces** — a conversation's canvas: pages, a pannable, zoomable dotted
  field, notes, text, frames and shapes, undo/redo, and collaborators' cursors.
- **Public session** (`/mock/s/:id`) — the reader between dashed rails, a
  reading-progress ruler, an account button, and a theme toggle scoped to the
  page. `?auth=1` reads it as the signed-in member; `publicShare()` in
  `src/mock/sessions-api.ts` decides which sessions are public and which allow
  guest comments.

Everything is local state over fixtures: sending, reacting, commenting,
creating and joining all work, and reset on reload.

## Shape

```
src/styles/     tokens.css    non-colour scales: rem type, control ladder, radius, layout, motion, z
                themes.css    dark (:root) and light — all OKLCH; any element can flip theme
                globals.css   the @theme inline bridge to Tailwind, @property, base layer
                utilities.css the named vocabulary: micro, figure, tag-*, scroll-fade, prose-session,
                              t-morph (a button that grows into its panel)…
src/components/ ui/           55 components — 29 on @base-ui/react — plus the agent and model marks
                patterns/     Panel, KpiStrip, StatCard, DotMatrix, Segmented, DataTable,
                              SettingCard, PersonAvatar, headers
                blocks/       DashedRails, PlusDecorator, GhostCards, ProgressiveBlur,
                              InfiniteSlider, Globe, TimelineCalendar, ScrollRail,
                              SessionPipeline, SessionTimeline
                shell/        AppShell (and its dock), Sidebar, SidebarControls, OrgSwitcher,
                              CommandMenu, ListDetail, SettingsShell, AuthSplit, UiScaleControl
                session/      the session reader: entry rail, tool calls, stats, comments,
                              share and comments morph panels
                chat/         conversation list, transcript, composer, header, menus,
                              assets panel, draft editor
                spaces/       the canvas, its nodes, chrome, pages, toolbar and cursors
                dashboard/    the dashboard's cards
                projects/     the new-project sheet
                gallery/      the gallery's own furniture
src/lib/        theme.tsx, ui-scale.tsx, org-context.tsx, hue.ts, motion.ts,
                use-measure.ts, resolved-color.ts, timeline-icons.ts
src/mock/       fixtures typed against the real server API shapes, on a pinned
                clock (time.ts) so server and client render the same "2h ago"
scripts/        screenshot.mjs — screenshots across routes, and a smoke test
                drive.mjs      — drives the shell and asserts its behaviours
tests/          the ratchet
```

## The rules, in one screen

- **Everything is OKLCH and almost everything has zero chroma.** Six surface
  steps in dark — page `0.08`, surface `0.10`, card `0.12`, illustration
  `0.13`, muted `0.15`, popover `0.17` — each one lighter than the last. In
  light the ramp saturates at white after the card and hierarchy is carried by
  the ring. The token layer is the only place a colour literal may appear.
- **Any element can switch theme.** Set `data-theme="light"` or `"dark"` on it
  and everything inside takes that theme's tokens, including the ones defined
  in terms of other tokens. The share panel, the comments panel and the
  new-project sheet are drawn in the opposite theme to the page this way.
- **The primary is the foreground, inverted.** No brand hue in the chrome.
  Focus is the foreground at 40%, selection at 22%. Tooltips are inverted
  too: a dark chip on the light theme, a light one on dark.
- **Two rules, not one.** `--hairline` (6–7%) for a rule _inside_ content,
  `--border` (8–9%) for the edge of a thing, `--border-strong` for focus.
- **Rings, not shadows.** A raised block is `rounded-xl bg-card ring-1
ring-foreground/10`. Only what floats over content it is not part of casts —
  menus, popovers, floating buttons, dialogs and sheets — and only
  `shadow-md` or `shadow-lg`.
- **Chroma has exactly two jobs.** Four status inks (success / warning /
  error / info) with `-muted` fills, and eight hues for _identity_ — labels,
  projects, roles, collaborators — via `.tag-<hue>` and `hueFor(id)`. Done is
  an achromatic check, not a colour. Counts that need you (unread, mentions)
  are red.
- **Rem on a 16px root × `--ui-scale`.** `--spacing` is Tailwind's `0.25rem`;
  the type scale runs 9 → 28px in nine rem steps with the body default at
  12px; controls are 20 / 24 / 28 / 32 / 36 with 28 the default. The scale
  control (0.9–1.4, ⌘⌥= / ⌘⌥- / ⌘⌥0) grows all of it together.
- **Geist, three weights.** 400 for text, 500 for emphasis, 300 for
  `.figure` only — the light hero numbers in a KPI strip. Nothing heavier.
  Geist Mono for code, refs and identifiers.
- **Buttons are pills.** `rounded-full` at every size with a 99% press scale.
  Everything you press is round; everything that contains is `rounded-xl`,
  up to `rounded-3xl` for a bottom sheet.
- **Springs for things that move, one ease for things that appear.**
  `SPRING_RAIL` 420/40, `SPRING_DOCK` 380/40, `SPRING_INDICATOR` 520/38,
  `SPRING_PILL` 560/42, `EASE_PANEL [0.22, 1, 0.36, 1]`, panels staggering in
  50ms apart. CSS durations for hover and menus. No overshoot — except the two
  playful touches that ask for it: the avatar stack's hover and a button
  growing into its panel.
- **Scrollbars are hidden everywhere** and scroll regions fade their edges
  with a mask that measures itself (`ScrollFade`, on `@property`).
- **Nine named z-layers.** Nothing writes a number. `popover` sits above
  `modal` on purpose.

All of it is enforced by `tests/design-system-ratchet.test.ts` — thirteen
rules held at zero, including OKLCH and `color-mix` literals in components,
raised shadows, `[var(--…)]` escapes, stock Tailwind ramps, arbitrary type
sizes, radii and z-indexes, and `dark:` variants.

## Porting it into the real app

See [PORTING.md](./PORTING.md).

## Screenshots and smoke tests

```bash
bun scripts/screenshot.mjs /mock/timeline "/mock/inbox#light" "/mock/timeline#dark#1440#900#scale=1.3"
bun scripts/drive.mjs
```

`screenshot.mjs` writes to `/tmp/shots` and exits non-zero if any page logged
an error, so it doubles as a smoke test across every route; the `scale=`
segment seeds `--ui-scale` so density scaling is checked too. `drive.mjs`
asserts what a screenshot cannot — the rail collapsing without losing rows,
the active pill sliding, edge fades, a clean hydration. Both need `bun dev`
running and a local Chromium.

## Licences

Third-party material — the model and agent marks, and the product logos — is
listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
