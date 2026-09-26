"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { SearchIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Icon } from "@/components/ui/icon"
import { Kbd } from "@/components/ui/kbd"

/**
 * ⌘K.
 *
 * Built on the Dialog primitive with a plain filtered list rather than `cmdk`,
 * which is Radix-based — pulling it in would put a second primitive engine in
 * a codebase that deliberately has one.
 *
 * The palette is a HUD, not a dialog: `glass-hud` plus the one glass blur, so
 * the page stays legible behind it and the palette reads as floating over the
 * app rather than replacing it. That is also why the scrim is `scrim-soft`.
 */

export type CommandAction = {
  id: string
  label: string
  group: string
  icon?: LucideIcon
  shortcut?: string
  to?: string
  onSelect?: () => void
}

function CommandMenu({
  open,
  onOpenChange,
  actions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  actions: Array<CommandAction>
}) {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  // Reset the query on close, not on open: resetting on open makes the
  // palette flash the full list for a frame before the filter reapplies.
  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matched = q
      ? actions.filter((a) => a.label.toLowerCase().includes(q))
      : actions
    const byGroup = new Map<string, Array<CommandAction>>()
    for (const action of matched) {
      const list = byGroup.get(action.group) ?? []
      list.push(action)
      byGroup.set(action.group, list)
    }
    return [...byGroup.entries()]
  }, [actions, query])

  function run(action: CommandAction) {
    onOpenChange(false)
    if (action.to) navigate({ to: action.to })
    action.onSelect?.()
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-overlay scrim-soft",
            "data-open:animate-fade-in data-closed:animate-fade-out"
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            // Sits high rather than centred: the results grow downward, and a
            // vertically-centred palette moves its own input as it filters.
            "fixed top-[18vh] left-1/2 z-modal w-full max-w-xl -translate-x-1/2",
            "glass-hud overflow-hidden rounded-xl bg-popover/85 backdrop-blur-glass",
            "data-open:animate-scale-in data-closed:animate-scale-out"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Command menu
          </DialogPrimitive.Title>

          <div className="flex h-control-xl items-center gap-2 border-b border-hairline px-3">
            <Icon
              icon={SearchIcon}
              size="sm"
              className="text-muted-foreground"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions, projects, people…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Kbd>Esc</Kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-1">
            {groups.length === 0 && (
              <p className="px-3 py-6 text-center caption">
                No matches for “{query}”
              </p>
            )}
            {groups.map(([group, items]) => (
              <div key={group} className="pb-1">
                <p className="px-2 py-1.5 micro">{group}</p>
                {items.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => run(action)}
                    className={cn(
                      "flex h-control-lg w-full items-center gap-2 rounded-md px-2 text-left",
                      "text-xs text-secondary-foreground",
                      "duration-fast transition-colors ease-out-strong",
                      "hover:bg-element-hover hover:text-foreground",
                      "focus-visible:bg-element-hover focus-visible:text-foreground"
                    )}
                  >
                    {action.icon && (
                      <Icon
                        icon={action.icon}
                        size="sm"
                        className="text-muted-foreground"
                      />
                    )}
                    <span className="flex-1 truncate">{action.label}</span>
                    {action.shortcut && (
                      <span className="text-3xs tracking-widest text-disabled">
                        {action.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Binds ⌘K / Ctrl+K. Returns the open state so a button can also trigger it. */
function useCommandMenu() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])
  return { open, setOpen }
}

export { CommandMenu, useCommandMenu }
