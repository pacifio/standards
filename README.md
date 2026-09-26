# Atlas Standards

The UI design system for the Atlas web app — and a mock of that app built on
it.

**Cursor's component language, Linear's layout and colour, Atlas's own panel
geometry.** Cursor for how a control looks and how a settings surface is
built; Linear for how you move around a workspace and for the surface ramp,
the action colour and the status/label system; Atlas for the curved panels and
hairline outlines that are its own, plus the structural scales — type,
density, motion, z-layers — it shares with the desktop app.

```bash
bun install
bun dev          # http://localhost:3000
bun test         # the design-system ratchet
bun run typecheck
```

## What is here

| Route | What it is |
|---|---|
| `/ds/foundations/*` | Colour, type, density, motion & depth — every token with its value and the reason it exists |
| `/ds/components/*` | 36 components: actions, forms, overlays, data, feedback. Every variant, size and state |
| `/ds/patterns` | The compositions that appear on more than one screen |
| `/mock/*` | The Atlas web app: Inbox, Timeline, Projects, Chat, Settings, Admin |

Both themes are fully designed. Toggle from the rail footer, or the sun icon in
the gallery nav.

## Shape

```
src/styles/     tokens.css   non-colour scales: type, density, radius, motion, z
                themes.css   dark (:root) and light ([data-theme="light"])
                globals.css  the @theme inline bridge to Tailwind + base layer
                utilities.css the named @utility vocabulary
src/components/ ui/          36 primitives on @base-ui/react, shadcn base-mira shape
                patterns/    setting cards, section headers, metrics — Cursor
                shell/       rail, org switcher, list-detail, command menu — Linear
                gallery/     the gallery's own furniture
src/lib/        theme.tsx, org-context.tsx
src/mock/       fixtures typed against the real server API shapes
tests/          the ratchet
```

## The rules, in one screen

- **Measured, not recalled.** Every colour was sampled from screenshots of the
  reference apps. Linear dark: rail `#070707`, canvas `#0f0f0f`, card
  `#171717`, border `#212121`. Cursor light: rail `#f3f3f3`, main `#f7f7f7`,
  detail `#fdfdfd`, border `#e4e4e4`.
- **The rail is darker than the canvas.** The content is a lit plane in front
  of a recessed rail. And nothing is pure `#000` — a true-black canvas has
  nothing below it to recess into, so the ramp runs out after two steps.
- **Indigo `#5e6ad2` is the action colour.** Primary buttons, focus, selection
  and the Done glyph. Chroma is not decoration here: in a session row the
  status glyph, the priority bars and the label dots carry most of the
  meaning.
- **Status and labels are different vocabularies.** Status is a state that
  changes (queued / running / done / failed). A label is an identity —
  `purple` means "the Design label", not "informational".
- **Borders, not shadows.** A shadow means a surface is floating. Three
  elevation rungs, and no fourth.
- **Nine type steps, two weights.** 500 and 600. Nothing lighter, nothing
  heavier.
- **A 4px grid** and five named control heights. 28px is the default control.
- **Three easings, four durations.** No springs, no overshoot. Hover
  transitions `background-color` and nothing else.
- **Nine named z-layers.** Nothing writes a number. `popover` sits above
  `modal` on purpose.

All of it is enforced by `tests/design-system-ratchet.test.ts`.

## Porting it into the real app

See [PORTING.md](./PORTING.md).

## Screenshots

```bash
bun scripts/screenshot.mjs /mock/timeline "/mock/inbox#light"
```

Writes to `/tmp/shots`, and exits non-zero if any page logged an error — so it
doubles as a smoke test across every route.
