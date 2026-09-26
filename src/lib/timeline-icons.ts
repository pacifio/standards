import {
  BrainIcon,
  CircleDotIcon,
  MessageSquareIcon,
  TerminalIcon,
  WrenchIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { TimelineEntryKind } from "@/mock/types"

/** One glyph per entry kind, shared by every surface that draws a timeline. */
export const ENTRY_ICON: Record<TimelineEntryKind, LucideIcon> = {
  prompt: MessageSquareIcon,
  thinking: BrainIcon,
  tool_call: WrenchIcon,
  response: TerminalIcon,
  checkpoint: CircleDotIcon,
}
