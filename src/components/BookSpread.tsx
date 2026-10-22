import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { BookCanvas, type BookCanvasHandle } from './BookCanvas'
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { useHorizontalSwipe, type BookPage } from '../hooks/useHorizontalSwipe'
import { t } from '../utils/browserLanguage'
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
  // Pages invisibles tant que le livre 3D n'est pas deploye (modele charge
  // puis cadrage de la camera termine, ~1 s) : le texte et la liste HTML
  // arrivaient avant le livre. Les donnees (App) se chargent pendant ce temps.
  const [bookReady, setBookReady] = useState(false)
  const handleBookReady = useCallback(() => setBookReady(true), [])

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
    // Remet isTurning a false en plus d'annuler le timer : sinon, si le
    // tournage suivant renvoie une duree nulle (return ci-dessus), plus rien
    // ne le remet a false et la liste reste masquee.
    return () => {
      clearTimeout(timeout)
      setIsTurning(false)
    }
  }, [page])

  const canGoNext = page < totalPages - 1
  const canGoPrevious = page > 0

  return (
    <div
      className="book-spread"
      data-mobile-page={mobilePage}
      data-book-ready={bookReady}
      {...swipeHandlers}
    >
      <div className="book-spread-strip" ref={stripRef}>
        <div className="book-spread-canvas">
          <BookCanvas ref={bookCanvasRef} onReady={handleBookReady} />
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
            {/* Annonce du numero de page aux lecteurs d'ecran. Toujours
                montee (hors de la porte isTurning) : une zone aria-live
                recreee avec son contenu n'est en general pas annoncee. */}
            <p className="visually-hidden" aria-live="polite">
              {t(`Page ${page + 1} sur ${totalPages}`, `Page ${page + 1} of ${totalPages}`)}
            </p>
            {/* Masque le temps de l'animation : simule la page qui cache son
                contenu en tournant. */}
            {!isTurning && right}
            {/* Pres de la reliure : retour en arriere accessible sans
                traverser l'ecran (utile en mobile, pratique aussi en
                desktop). */}
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
