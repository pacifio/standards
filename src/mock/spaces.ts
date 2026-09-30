import { minutesBefore } from "@/mock/time"

/**
 * Spaces fixtures: the pages of a conversation's shared canvas, and what is
 * on each one.
 *
 * Shaped like the Atlas desktop app's space document, flattened: a node is a
 * box in canvas coordinates (x/y top-left, w/h size, all in canvas px at
 * zoom 1) plus the fields its kind draws. There are no edges and no
 * grouping linkage — a frame contains a note only in the sense that the
 * note sits inside its rectangle, which is also all the real contract says.
 *
 * Times are on the pinned mock clock, so "Updated 5 minutes ago" renders
 * the same on the server and the client.
 */

export type SpaceShape = "rectangle" | "ellipse" | "diamond" | "triangle"

export type SpaceNodeKind = "note" | "text" | "frame" | "shape" | "image"

export type SpaceNode = {
  id: string
  kind: SpaceNodeKind
  x: number
  y: number
  w: number
  h: number
  /** Note heading, frame label, shape label. */
  title?: string
  /** Note body. */
  body?: string
  /** A text node's words. */
  text?: string
  /** Shapes only. */
  shape?: SpaceShape
}

export type SpacePage = {
  id: string
  kind: "page" | "folder"
  name: string
  /** ISO, on the mock clock. */
  updatedAt: string
  nodes: Array<SpaceNode>
}

/** The box a new node of each kind gets when it is dropped with a tool. */
export const NODE_DEFAULT_SIZE: Record<
  SpaceNodeKind,
  { w: number; h: number }
> = {
  note: { w: 220, h: 140 },
  text: { w: 240, h: 80 },
  frame: { w: 320, h: 200 },
  shape: { w: 160, h: 100 },
  image: { w: 240, h: 160 },
}

const ENGINEERING: Array<SpacePage> = [
  {
    id: "pg-board-facets",
    kind: "page",
    name: "Board facets",
    updatedAt: minutesBefore(5),
    nodes: [
      {
        id: "n-heading",
        kind: "text",
        x: 0,
        y: 0,
        w: 420,
        h: 40,
        text: "Board facets — the query plan",
      },
      {
        id: "n-frame",
        kind: "frame",
        x: 0,
        y: 90,
        w: 520,
        h: 220,
        title: "Ingest",
      },
      {
        id: "n-note-ingest",
        kind: "note",
        x: 24,
        y: 124,
        w: 220,
        h: 140,
        title: "Facet counts",
        body: "Counts come from one GROUP BY over the session index, not a query per facet. 40ms → 6ms on the staging board.",
      },
      {
        id: "n-note-cache",
        kind: "note",
        x: 272,
        y: 124,
        w: 220,
        h: 140,
        title: "Cache key",
        body: "Org + filter hash. Invalidate on session.finished, never on a timer.",
      },
      {
        id: "n-shape-api",
        kind: "shape",
        shape: "rectangle",
        x: 600,
        y: 150,
        w: 160,
        h: 100,
        title: "Board API",
      },
      {
        id: "n-shape-decide",
        kind: "shape",
        shape: "diamond",
        x: 600,
        y: 320,
        w: 160,
        h: 110,
        title: "Cached?",
      },
      {
        id: "n-shape-client",
        kind: "shape",
        shape: "ellipse",
        x: 820,
        y: 150,
        w: 150,
        h: 100,
        title: "Web client",
      },
      {
        id: "n-note-open",
        kind: "note",
        x: 820,
        y: 320,
        w: 220,
        h: 140,
        title: "Open question",
        body: "Do agent sessions count toward a member's facet, or get their own row?",
      },
    ],
  },
  {
    id: "pg-retro",
    kind: "page",
    name: "Retro",
    updatedAt: minutesBefore(3 * 24 * 60),
    nodes: [
      {
        id: "n-retro-good",
        kind: "note",
        x: 0,
        y: 0,
        w: 220,
        h: 140,
        title: "Went well",
        body: "Timeline shipped behind the flag a week early.",
      },
      {
        id: "n-retro-bad",
        kind: "note",
        x: 250,
        y: 0,
        w: 220,
        h: 140,
        title: "Went badly",
        body: "Two migrations collided on the sessions table.",
      },
      {
        id: "n-retro-try",
        kind: "note",
        x: 500,
        y: 0,
        w: 220,
        h: 140,
        title: "Try next",
        body: "One migration owner per sprint.",
      },
    ],
  },
]

/**
 * A conversation's pages. Every conversation has a Space; one nobody has
 * drawn in yet opens on a single empty "Canvas" page.
 */
export function spacePagesFor(convId: string): Array<SpacePage> {
  if (convId === "ch-engineering") return ENGINEERING
  return [
    {
      id: `pg-${convId}-canvas`,
      kind: "page",
      name: "Canvas",
      updatedAt: minutesBefore(60),
      nodes: [],
    },
  ]
}
