import { useRef, type PointerEvent, type RefObject } from 'react'

export type BookPage = 'left' | 'right'

/** Distance horizontale minimale d'un swipe (px). */
const SWIPE_MIN_DISTANCE = 50
/** Deplacement maximal d'un tap (px). */
const TAP_MAX_DISTANCE = 10

/**
 * Navigation mobile entre les deux pages : swipe horizontal, ou tap sur le
 * bord visible de l'autre page. Le scroll vertical reste au navigateur
 * (`touch-action: pan-y`).
 */
export function useHorizontalSwipe(
  enabled: boolean,
  page: BookPage,
  onPageChange: (page: BookPage) => void,
  stripRef: RefObject<HTMLElement | null>,
) {
  const start = useRef<{ x: number; y: number } | null>(null)

  if (!enabled) return {}

  return {
    onPointerDown: (event: PointerEvent) => {
      start.current = { x: event.clientX, y: event.clientY }
    },
    onPointerCancel: () => {
      start.current = null
    },
    onPointerUp: (event: PointerEvent) => {
      if (!start.current) return
      const dx = event.clientX - start.current.x
      const dy = event.clientY - start.current.y
      start.current = null

      if (Math.abs(dx) >= SWIPE_MIN_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const next: BookPage = dx < 0 ? 'right' : 'left'
        if (next !== page) onPageChange(next)
        return
      }

      if (Math.hypot(dx, dy) > TAP_MAX_DISTANCE || !stripRef.current) return
      const rect = stripRef.current.getBoundingClientRect()
      const spineX = rect.left + rect.width / 2
      if (page === 'right' && event.clientX < spineX) onPageChange('left')
      else if (page === 'left' && event.clientX > spineX) onPageChange('right')
    },
  }
}
