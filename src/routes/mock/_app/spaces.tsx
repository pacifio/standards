import { createFileRoute } from "@tanstack/react-router"

import { CONVERSATIONS } from "@/mock/chat"
import { SpaceView } from "@/components/spaces/space-view"

export const Route = createFileRoute("/mock/_app/spaces")({
  component: SpacesScreen,
  // `c` is the conversation whose Space this is, so a chat header can link
  // straight into its canvas and the canvas can link back.
  validateSearch: (search: Record<string, unknown>): { c?: string } =>
    typeof search.c === "string" ? { c: search.c } : {},
})

/**
 * Spaces: a conversation's shared canvas, full-bleed in the main panel.
 *
 * Unknown or missing `c` falls back to the first conversation rather than
 * an empty state — the mock always has a Space to show. Keyed by the
 * conversation, so switching conversations starts a fresh Space instead of
 * carrying one channel's pages into another.
 */
function SpacesScreen() {
  const { c } = Route.useSearch()
  const conversation = CONVERSATIONS.find((x) => x.id === c) ?? CONVERSATIONS[0]
  return <SpaceView key={conversation.id} conversation={conversation} />
}
