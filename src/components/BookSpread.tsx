import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BookCanvas, type BookCanvasHandle } from './BookCanvas'
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { useHorizontalSwipe, type BookPage } from '../hooks/useHorizontalSwipe'
import { PageTurnZone } from './PageTurnZone'
import './BookSpread.css'
import './BookSpread.mobile.css'
import './SpellDetailPanel.css'
import './SpellListPanel.css'

interface BookSpreadProps {
  /** Contenu de la page de gauche (fiche de sort). */
  left: ReactNode
  /** Contenu de la page de droite (recherche, filtres, liste). */
  right: ReactNode
  /** Mobile uniquement : page visible. Ignore en desktop. */
  mobilePage: BookPage
  onMobilePageChange: (page: BookPage) => void
  /** Pagination de la liste de sorts : partagee avec les zones de clic sur
      le livre (coins) et l'animation de tournage de page. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Mise en page a deux pages : canvas Three.js en fond, contenu HTML existant
 * en superposition (aucun composant ne passe en rendu 3D).
 * Desktop : les deux pages cote a cote.
 * Mobile : .book-spread devient une fenetre sur une bande plus large que
 * l'ecran (canvas + deux pages, meme mise en page qu'en desktop). La bande
 * glisse (translateX) pour montrer une moitie du livre a la fois, le bord de
 * l'autre page restant visible. Le canvas n'est jamais recadre : c'est la
 * fenetre qui se deplace sur le livre.
 */
export function BookSpread({
  left,
  right,
  mobilePage,
  onMobilePageChange,
  page,
  totalPages,
  onPageChange,
}: BookSpreadProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const stripRef = useRef<HTMLDivElement>(null)
  const swipeHandlers = useHorizontalSwipe(isMobile, mobilePage, onMobilePageChange, stripRef)
  const bookCanvasRef = useRef<BookCanvasHandle>(null)
  // Masque le contenu de la page de droite (liste) le temps de l'animation
  // de tournage, comme une vraie page qui cache ce qu'il y a dessous le
  // temps de tourner. Le contenu re-apparait deja a jour (sur la NOUVELLE
  // page) : `right` est recalcule des le `onPageChange`, avant meme la fin
  // de l'animation.
  const [isTurning, setIsTurning] = useState(false)

  // Joue l'animation de tournage de page a CHAQUE changement de `page`, peu
  // importe la source (boutons Precedent/Suivant, zones de clic sur les
  // coins du livre). Comparaison avec la valeur precedente (pas seulement
  // "page a change") pour choisir le sens (avant/arriere). `undefined` au
  // montage : pas d'animation sur la page initiale.
  const previousPageRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    const previousPage = previousPageRef.current
    previousPageRef.current = page
    if (previousPage === undefined || previousPage === page) return
    const duration =
      page > previousPage
        ? bookCanvasRef.current?.playNext()
        : bookCanvasRef.current?.playPrevious()
    if (!duration) return
    setIsTurning(true)
    const timeout = setTimeout(() => setIsTurning(false), duration * 1000)
    return () => clearTimeout(timeout)
  }, [page])

  const canGoNext = page < totalPages - 1
  const canGoPrevious = page > 0

  return (
    <div className="book-spread" data-mobile-page={mobilePage} {...swipeHandlers}>
      <div className="book-spread-strip" ref={stripRef}>
        <div className="book-spread-canvas">
          <BookCanvas ref={bookCanvasRef} />
        </div>
        <div className="book-spread-pages">
          {/* inert : la page hors ecran n'est ni lue par les lecteurs d'ecran
              ni atteignable au focus. Les taps la traversent (hit-testing
              comme pointer-events: none) et remontent a .book-spread. */}
          <section
            className="book-page spell-detail-panel"
            inert={isMobile && mobilePage !== 'left'}
          >
            {left}
            {/* Desktop uniquement (voir docs/SPRINT-3-RENDU-3D-RESPONSIVE.md) :
                retour en arriere depuis le bas de la page de gauche. En
                mobile, cette section est `inert` quand elle n'est pas
                affichee, donc ce bouton l'est aussi automatiquement. Pas de
                bouton du tout sur la premiere page (rien a isoler) ni
                pendant l'animation (evite un second declenchement). */}
            {!isMobile && canGoPrevious && !isTurning && (
              <PageTurnZone
                direction="previous"
                corner="bottom-left"
                onClick={() => onPageChange(page - 1)}
              />
            )}
          </section>
          <section
            className="book-page spell-list-panel"
            inert={isMobile && mobilePage !== 'right'}
          >
            {/* Masque le temps de l'animation : simule la page qui cache son
                contenu en tournant. */}
            {!isTurning && right}
            {/* Pres de la reliure : retour en arriere accessible sans
                traverser l'ecran (utile en mobile, pratique aussi en
                desktop). Redondant avec la zone de la page de gauche en
                desktop, volontairement. */}
            {canGoPrevious && !isTurning && (
              <PageTurnZone
                direction="previous"
                corner="bottom-left"
                onClick={() => onPageChange(page - 1)}
              />
            )}
            {canGoNext && !isTurning && (
              <PageTurnZone
                direction="next"
                corner="bottom-right"
                onClick={() => onPageChange(page + 1)}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
