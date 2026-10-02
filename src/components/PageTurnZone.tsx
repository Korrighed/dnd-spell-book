import './PageTurnZone.css'
import './PageTurnZone.mobile.css'

interface PageTurnZoneProps {
  /** Sens de la pagination declenchee par ce bouton. */
  direction: 'next' | 'previous'
  /** Coin du panneau parent (position:absolute, voir PageTurnZone.css) ou se place le bouton. */
  corner: 'bottom-left' | 'bottom-right'
  onClick: () => void
}

/**
 * Remplace les boutons texte "Precedent"/"Suivant" par un triangle colore,
 * place dans un coin du livre plutot qu'en ligne sous la liste. N'est rendu
 * par l'appelant (BookSpread) que quand l'action est possible : pas de
 * bouton desactive isole sur la premiere/derniere page.
 * Couleur Caput Mortuum (#632024, docs/DESIGN.md : "Accent / action /
 * element interactif").
 */
export function PageTurnZone({ direction, corner, onClick }: PageTurnZoneProps) {
  const label = direction === 'next' ? 'Page suivante' : 'Page precedente'

  return (
    <button
      type="button"
      className={`page-turn-zone page-turn-zone--${direction} page-turn-zone--${corner}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    />
  )
}
