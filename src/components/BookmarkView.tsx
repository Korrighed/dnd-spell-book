import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { bookmarkViewId, type BookmarkId } from '../utils/bookmarks'
import { t } from '../utils/browserLanguage'
import { getScreenScale } from '../utils/screenScale'

interface BookmarkViewProps {
  id: BookmarkId
  /** Fermee : masquee par `hidden`, mais toujours montee. */
  open: boolean
  title: ReactNode
  /** Le retour du focus au marque-page est fait par l'appelant. */
  onClose: () => void
  className?: string
  children: ReactNode
}

/** Glissement (px internes) au-dela duquel le relachement ferme la vue. */
const SWIPE_CLOSE_DISTANCE = 100
/** Aligne sur la transition de App.mobile.css. */
const SWIPE_EXIT_MS = 200

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Arrets de tabulation visibles de `root`, un seul par groupe radio (comme le navigateur). */
function tabStopsIn(root: HTMLElement): HTMLElement[] {
  const visible = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.getClientRects().length > 0,
  )
  return visible.filter((element) => {
    if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || !element.name) {
      return true
    }
    const group = visible.filter(
      (other) =>
        other instanceof HTMLInputElement && other.type === 'radio' && other.name === element.name,
    ) as HTMLInputElement[]
    const checked = group.find((radio) => radio.checked)
    return element === (checked ?? group[0])
  })
}

/**
 * Vue ouverte par un marque-page, par-dessus le livre. Toujours montee pour
 * garder l'etat des formulaires. Escape ferme la vue ; Tab et Maj+Tab
 * bouclent dedans. Mobile : panneau qu'on tire vers le bas pour fermer.
 */
export function BookmarkView({
  id,
  open,
  title,
  onClose,
  className,
  children,
}: BookmarkViewProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const drag = useRef<{ pointerId: number; startY: number; dy: number } | null>(null)
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const canSwipe = isMobile
  const titleId = `${bookmarkViewId(id)}-title`

  // Panneau mobile jusqu'au bas de l'ecran. Mesures a l'ecran divisees par le
  // zoom de #root : la hauteur s'applique en px internes.
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!open || !canSwipe || !section) return
    const fit = () => {
      const top = section.getBoundingClientRect().top
      const height = Math.max(0, window.innerHeight - top) / getScreenScale()
      section.style.setProperty('--sheet-height', `${height}px`)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => {
      window.removeEventListener('resize', fit)
      section.style.removeProperty('--sheet-height')
    }
  }, [open, canSwipe])

  // Glisser vers le bas depuis la poignee ou le titre.
  function onDragStart(event: ReactPointerEvent<HTMLElement>) {
    if (!canSwipe || event.button !== 0) return
    // Un appui sur un bouton (croix) reste un clic.
    if ((event.target as Element).closest('button')) return
    drag.current = { pointerId: event.pointerId, startY: event.clientY, dy: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
    sectionRef.current?.classList.add('is-dragging')
  }

  function onDragMove(event: ReactPointerEvent<HTMLElement>) {
    const current = drag.current
    const section = sectionRef.current
    if (!current || !section || current.pointerId !== event.pointerId) return
    // Distance a l'ecran ramenee en px internes (zoom de #root).
    current.dy = Math.max(0, event.clientY - current.startY) / getScreenScale()
    section.style.transform = `translateY(${current.dy}px)`
  }

  function onDragEnd(event: ReactPointerEvent<HTMLElement>) {
    const current = drag.current
    const section = sectionRef.current
    if (!current || !section || current.pointerId !== event.pointerId) return
    drag.current = null
    section.classList.remove('is-dragging')
    if (event.type === 'pointerup' && current.dy > SWIPE_CLOSE_DISTANCE) {
      section.style.transform = 'translateY(100%)'
      window.setTimeout(() => {
        section.style.transform = ''
        onClose()
      }, SWIPE_EXIT_MS)
      return
    }
    section.style.transform = ''
  }

  const dragHandlers = canSwipe
    ? {
        onPointerDown: onDragStart,
        onPointerMove: onDragMove,
        onPointerUp: onDragEnd,
        onPointerCancel: onDragEnd,
      }
    : {}

  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])

  // tabIndex -1 : un clic dans la vue y garde le focus, pour qu'Echap la ferme.
  return (
    <section
      ref={sectionRef}
      id={bookmarkViewId(id)}
      className={className ? `bookmark-view ${className}` : 'bookmark-view'}
      role="dialog"
      aria-labelledby={titleId}
      hidden={!open}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
          return
        }
        if (event.key !== 'Tab') return
        const stops = tabStopsIn(event.currentTarget)
        if (stops.length === 0) return
        const first = stops[0]
        const last = stops[stops.length - 1]
        const active = document.activeElement
        const atStart =
          active === first || active === titleRef.current || active === event.currentTarget
        if (event.shiftKey && atStart) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }}
    >
      {canSwipe && (
        <div className="bookmark-view-handle" aria-hidden="true" {...dragHandlers} />
      )}
      <h2
        id={titleId}
        ref={titleRef}
        tabIndex={-1}
        className={canSwipe ? 'bookmark-view-drag-title' : undefined}
        {...dragHandlers}
      >
        {title}
      </h2>
      <button
        type="button"
        className="bookmark-view-close"
        aria-label={t('Fermer', 'Close')}
        title={t('Fermer', 'Close')}
        onClick={onClose}
      >
        <span
          className="bookmark-view-close-icon"
          aria-hidden="true"
          style={{ '--icon': `url(${import.meta.env.BASE_URL}icons/x.svg)` } as CSSProperties}
        />
      </button>
      {children}
    </section>
  )
}
