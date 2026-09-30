import { useRef, type ReactNode } from 'react'
import { BookCanvas } from './BookCanvas'
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { useHorizontalSwipe, type BookPage } from '../hooks/useHorizontalSwipe'
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
export function BookSpread({ left, right, mobilePage, onMobilePageChange }: BookSpreadProps) {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const stripRef = useRef<HTMLDivElement>(null)
  const swipeHandlers = useHorizontalSwipe(isMobile, mobilePage, onMobilePageChange, stripRef)

  return (
    <div className="book-spread" data-mobile-page={mobilePage} {...swipeHandlers}>
      <div className="book-spread-strip" ref={stripRef}>
        <div className="book-spread-canvas">
          <BookCanvas />
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
          </section>
          <section
            className="book-page spell-list-panel"
            inert={isMobile && mobilePage !== 'right'}
          >
            {right}
          </section>
        </div>
      </div>
    </div>
  )
}
