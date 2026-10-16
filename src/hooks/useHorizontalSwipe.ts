import { useRef, type PointerEvent, type RefObject } from 'react'

export type BookPage = 'left' | 'right'

/** Distance horizontale minimale (px) pour qu'un geste compte comme un swipe. */
const SWIPE_MIN_DISTANCE = 50
/** Un tap bouge moins que ca (px) : au-dela, ce n'est ni un tap ni un swipe. */
const TAP_MAX_DISTANCE = 10

/**
 * Navigation mobile entre les deux pages du livre, par pointer events.
 * - Swipe horizontal : vers la gauche -> page droite, vers la droite -> page
 *   gauche. Les gestes surtout verticaux sont ignores (scroll des pages).
 * - Tap de l'autre cote de la reliure (sur le bord visible de l'autre page) :
 *   bascule vers cette page. La reliure = milieu de `stripRef`, transform
 *   compris : aucune valeur de peek a dupliquer ici.
 * Le scroll vertical natif reste possible grace a `touch-action: pan-y`
 * (BookSpread.css) : le navigateur annule alors le geste (pointercancel).
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
