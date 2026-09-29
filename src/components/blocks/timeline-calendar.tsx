"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useInView } from "motion/react"
import { cn } from "cn"

import { EASE_PANEL } from "@/lib/motion"

/**
 * The timeline calendar: a list grouped by day under one sticky date that
 * changes as you scroll into the next day.
 *
 * Each day has its own header in the flow. A single sticky header sits over
 * the top of the list and always names the day you are reading — it is
 * pulled up over the first day's own header (`-mt-*` on the list, same
 * height as the header) so at rest there is one date, not two. As a day
 * crosses a line just under the sticky header, that day becomes current and
 * its date slides in.
 *
 * Needs the scroll container as `root`: in this shell the page never
 * scrolls, a panel does, and an observer on the viewport would never fire.
 */

export type CalendarDay = {
  id: string
  /** The bright part, e.g. "September 29". */
  date: string
  /** The quiet part after the slash, e.g. "Today" or "Monday". */
  day: string
  /** Right-aligned summary of the day — counts, totals, a face stack. */
  meta?: React.ReactNode
  children: React.ReactNode
}

/** Header height; the sticky header and each day's header share it. */
const HEADER = "h-12"

function TimelineCalendar({
  days,
  root,
  className,
}: {
  days: Array<CalendarDay>
  root: React.RefObject<HTMLElement | null>
  className?: string
}) {
  const [currentId, setCurrentId] = useState(days[0]?.id)
  const current = days.find((d) => d.id === currentId) ?? days.at(0)

  // A filter can remove the day that was current; fall back to the first.
  useEffect(() => {
    if (!days.some((d) => d.id === currentId)) setCurrentId(days[0]?.id)
  }, [days, currentId])

  if (!current) return null

  return (
    <div data-slot="timeline-calendar" className={className}>
      {/* The backing bleeds 1rem past each side: rows widen their hover
          background past the column's edges, and without the bleed that
          background shows either side of the date as a row scrolls under. */}
      <header
        className={cn(
          HEADER,
          "sticky top-0 z-panel flex items-end border-b border-border bg-background pb-2.5",
          "before:absolute before:-inset-x-4 before:inset-y-0 before:-z-10 before:bg-background"
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={current.id}
            initial={{ x: -6, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_PANEL }}
            className="flex flex-1 items-end justify-between gap-3"
          >
            <span className="text-lg tracking-tight">
              <span className="font-medium text-foreground">
                {current.date}
              </span>
              <span className="text-muted-foreground"> / {current.day}</span>
            </span>
            {current.meta}
          </motion.div>
        </AnimatePresence>
      </header>

      {/* `isolate`: rows may raise their own links (z-10) above a stretched
          row link; this keeps those layers inside the list, under the
          sticky date, instead of painting over it. */}
      <div className="isolate -mt-12">
        {days.map((day) => (
          <Day
            key={day.id}
            day={day}
            root={root}
            onCurrent={() => setCurrentId(day.id)}
          />
        ))}
        {/* Room for the last day to reach the top and become current;
            without it the final days could never be the sticky date. */}
        <div aria-hidden="true" className="h-[80vh]" />
      </div>
    </div>
  )
}

function Day({
  day,
  root,
  onCurrent,
}: {
  day: CalendarDay
  root: React.RefObject<HTMLElement | null>
  onCurrent: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  // A line at the very top of the scroller: a day becomes current only once
  // its own header has slid fully under the sticky one, so the date is
  // never on screen twice.
  const inView = useInView(ref, {
    root,
    amount: 0,
    margin: "-1px 0px -100% 0px",
  })

  useEffect(() => {
    if (inView) onCurrent()
  }, [inView, onCurrent])

  return (
    // Padding, not margin: the gap belongs to the day above it, so the
    // trigger line is never in no-man's-land between two days.
    <section ref={ref} aria-label={`${day.date}, ${day.day}`} className="pb-10">
      <h2
        className={cn(
          HEADER,
          "flex items-end justify-between gap-3 border-b border-border pb-2.5"
        )}
      >
        <span className="text-lg tracking-tight">
          <span className="font-medium text-foreground">{day.date}</span>
          <span className="text-muted-foreground">&nbsp;/ {day.day}</span>
        </span>
        {day.meta}
      </h2>
      {day.children}
    </section>
  )
}

export { TimelineCalendar }
