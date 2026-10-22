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
  /** Vue visible. Fermee : masquee par `hidden`, mais toujours montee. */
  open: boolean
  /** Contenu du titre (h2), bilingue comme le reste de l'interface. */
  title: ReactNode
  /** Bouton Fermer et touche Escape. Le retour du focus au marque-page est fait par l'appelant. */
  onClose: () => void
  /** Classe en plus de .bookmark-view (ex. .help-view, autre emprise et fond). */
  className?: string
  children: ReactNode
}

/** Distance de glissement (px) au-dela de laquelle le relachement ferme la vue. */
const SWIPE_CLOSE_DISTANCE = 100
/** Duree de la sortie par le bas, alignee sur la transition de App.mobile.css. */
const SWIPE_EXIT_MS = 200

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Arrets de tabulation de `root`, dans l'ordre du document : elements
 * visibles seulement, et un seul arret par groupe de boutons radio (le
 * bouton coche, ou le premier du groupe si aucun ne l'est), comme le
 * navigateur.
 */
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
 * Coquille d'une vue ouverte par un marque-page, affichee par-dessus le livre
 * (App.css : .book-zone / .bookmark-view). Toujours montee : garde l'etat des
 * formulaires (renommage en cours, cache des sous-classes) entre deux
 * ouvertures, et la cible de aria-controls existe toujours.
 * Escape ecoute sur la vue et pas sur document : Escape dans la recherche
 * doit seulement vider le champ, pas fermer la vue.
 * Tab et Maj+Tab bouclent dans la vue (non modale au sens ARIA : les onglets
 * restent cliquables a la souris pour passer d'une vue a l'autre).
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
  // Mobile : chaque vue est un panneau qu'on tire vers le bas pour le fermer.
  const canSwipe = isMobile
  const titleId = `${bookmarkViewId(id)}-title`

  // Panneau mobile : du dessous des onglets jusqu'au bas de l'ecran. Le bas
  // du livre ne tombe pas pile sur le bas de l'ecran : hauteur calculee a
  // l'ouverture (et au redimensionnement), lue par App.mobile.css. Mesures a
  // l'ecran divisees par le zoom de #root : la hauteur s'applique en px internes.
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

  // Glisser vers le bas depuis la poignee ou le titre : la vue suit le doigt,
  // puis se ferme au-dela de SWIPE_CLOSE_DISTANCE, sinon revient en place.
  // Le contenu, lui, garde son defilement normal.
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
    // Distance a l'ecran ramenee en px internes (zoom de #root) : la vue suit le doigt.
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

  // A l'ouverture, le focus entre dans la vue (sur le titre).
  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])

  // tabIndex -1 : un clic sur du texte de la vue y laisse le focus (sinon il
  // part sur body et Echap ne ferme plus rien). Pas dans l'ordre de tabulation.
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
        // Tab boucle dans la vue : sans ca, le focus sortait vers le pied de
        // page et la barre d'outils, ou Escape ne fermait plus rien.
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
      {/* Poignee du panneau mobile. Decorative : au clavier, Echap et la
          croix ferment la vue. */}
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
      {/* Croix seule, meme aspect que les onglets : le libelle passe en
          aria-label (nom accessible) et title (infobulle). */}
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
