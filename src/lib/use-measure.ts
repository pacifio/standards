import { useCallback, useState } from "react"

/**
 * The size of an element, kept current through a ResizeObserver.
 *
 * Returns a callback ref rather than taking one, so it can be attached to a
 * `motion.div` or anything else without a forwarded ref dance. Replaces
 * `react-use-measure` for the one component that needed it.
 */
export function useMeasure<T extends HTMLElement = HTMLElement>() {
  const [rect, setRect] = useState({ width: 0, height: 0 })
  const [observer, setObserver] = useState<ResizeObserver | null>(null)

  const ref = useCallback(
    (node: T | null) => {
      observer?.disconnect()
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
      setObserver(next)
    },
    // The observer is intentionally not a dependency: it is the thing being
    // replaced, and reading it here only serves to tear the old one down.
    []
  )

  return [ref, rect] as const
}
