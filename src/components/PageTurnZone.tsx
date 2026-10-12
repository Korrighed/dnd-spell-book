import './PageTurnZone.css'

interface PageTurnZoneProps {
  /** Sens de la pagination declenchee par ce bouton. */
  direction: 'next' | 'previous'
  /** Coin du panneau parent (position:absolute, voir PageTurnZone.css) ou se place le bouton. */
  corner: 'bottom-left' | 'bottom-right'
  onClick: () => void
}

/**
 * Bouton de pagination place dans un coin du livre, plutot qu'en ligne sous
 * la liste. Icone SVG (public/icons/circle-arrow-*.svg). N'est rendu
 * par l'appelant (BookSpread) que quand l'action est possible : pas de
 * bouton desactive isole sur la premiere/derniere page.
 */
export function PageTurnZone({ direction, corner, onClick }: PageTurnZoneProps) {
  const label = direction === 'next' ? 'Page suivante' : 'Page precedente'
  const icon = direction === 'next' ? 'circle-arrow-right.svg' : 'circle-arrow-left.svg'

  return (
    <button
      type="button"
      className={`page-turn-zone page-turn-zone--${corner}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <img src={`${import.meta.env.BASE_URL}icons/${icon}`} alt="" draggable={false} />
    </button>
  )
}
