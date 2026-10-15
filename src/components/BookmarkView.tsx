import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { bookmarkViewId, type BookmarkId } from '../utils/bookmarks'
import { t } from '../utils/browserLanguage'

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
  const titleId = `${bookmarkViewId(id)}-title`

  // A l'ouverture, le focus entre dans la vue (sur le titre).
  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])

  // tabIndex -1 : un clic sur du texte de la vue y laisse le focus (sinon il
  // part sur body et Echap ne ferme plus rien). Pas dans l'ordre de tabulation.
  return (
    <section
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
      <h2 id={titleId} ref={titleRef} tabIndex={-1}>
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
