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
  /** Page de gauche : fiche de sort. */
  left: ReactNode
  /** Page de droite : liste. */
  right: ReactNode
  /** Mobile uniquement : page visible. */
  mobilePage: BookPage
  onMobilePageChange: (page: BookPage) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Livre a deux pages : canvas Three.js en fond, pages HTML par-dessus.
 * Mobile : fenetre sur une bande (canvas + pages) qui glisse d'une moitie du
 * livre a l'autre.
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
  // Liste masquee pendant l'animation de tournage de page.
  const [isTurning, setIsTurning] = useState(false)
  // Pages invisibles tant que le livre 3D n'est pas deploye.
  const [bookReady, setBookReady] = useState(false)
  const handleBookReady = useCallback(() => setBookReady(true), [])

  // Animation de tournage a chaque changement de `page`, dans le sens du
  // changement. Aucune au montage.
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
    // Remise a false ici aussi : un tournage suivant de duree nulle ne le ferait pas.
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
          {/* Mobile : la page hors ecran est inerte (ni focus ni lecteur d'ecran). */}
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
            {/* Toujours montee : une zone aria-live recreee n'est pas annoncee. */}
            <p className="visually-hidden" aria-live="polite">
              {t(`Page ${page + 1} sur ${totalPages}`, `Page ${page + 1} of ${totalPages}`)}
            </p>
            {!isTurning && right}
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
