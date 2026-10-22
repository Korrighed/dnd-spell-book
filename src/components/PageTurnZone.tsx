import type { CSSProperties } from 'react'
import { t } from '../utils/browserLanguage'
import './PageTurnZone.css'

interface PageTurnZoneProps {
  direction: 'next' | 'previous'
  corner: 'bottom-left' | 'bottom-right'
  onClick: () => void
}

/** Bouton de pagination dans un coin de la page. Rendu seulement si l'action est possible. */
export function PageTurnZone({ direction, corner, onClick }: PageTurnZoneProps) {
  const label = direction === 'next' ? t('Page suivante', 'Next page') : t('Page précédente', 'Previous page')
  const icon = direction === 'next' ? 'circle-arrow-right.svg' : 'circle-arrow-left.svg'

  return (
    <button
      type="button"
      className={`page-turn-zone page-turn-zone--${corner}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span
        className="page-turn-zone-icon"
        aria-hidden="true"
        style={{ '--icon': `url(${import.meta.env.BASE_URL}icons/${icon})` } as CSSProperties}
      />
    </button>
  )
}
