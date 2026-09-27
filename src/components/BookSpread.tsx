import type { ReactNode } from 'react'
import { BookCanvas } from './BookCanvas'
import './BookSpread.css'
import './SpellDetailPanel.css'
import './SpellListPanel.css'

interface BookSpreadProps {
  /** Contenu de la page de gauche (fiche de sort). */
  left: ReactNode
  /** Contenu de la page de droite (recherche, filtres, liste). */
  right: ReactNode
}

/**
 * Mise en page a deux pages : canvas Three.js en fond, contenu HTML existant
 * en superposition (aucun composant ne passe en rendu 3D). Desktop : les deux
 * pages cote a cote. Mobile : une page a la fois, defilement horizontal en
 * scroll-snap (swipe natif, sans JS de geste a maintenir).
 */
export function BookSpread({ left, right }: BookSpreadProps) {
  return (
    <div className="book-spread">
      <div className="book-spread-canvas">
        <BookCanvas />
      </div>
      <div className="book-spread-pages">
        <section className="book-page spell-detail-panel">{left}</section>
        <section className="book-page spell-list-panel">{right}</section>
      </div>
    </div>
  )
}
