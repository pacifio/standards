import { useCallback, useRef, useState } from "react"

/**
 * The size of an element, kept current through a ResizeObserver.
 *
 * Returns a callback ref rather than taking one, so it can be attached to a
 * `motion.div` or anything else without a forwarded ref dance. Replaces
 * `react-use-measure` for the one component that needed it.
 */
export function useMeasure<T extends HTMLElement = HTMLElement>() {
  const [rect, setRect] = useState({ width: 0, height: 0 })
  // A ref, not state: the callback below is created once, so it must read
  // the CURRENT observer to disconnect it. Reading it from state captured
  // the first render's `null` and never let an old observer go — and an
  // observer left on a detached element reports 0×0, clobbering the size.
  const observer = useRef<ResizeObserver | null>(null)

  const ref = useCallback((node: T | null) => {
    observer.current?.disconnect()
    observer.current = null
    if (!node) return
    const next = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setRect((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height }
      )
    })
    next.observe(node)
    observer.current = next
  }, [])

  return [ref, rect] as const
}
