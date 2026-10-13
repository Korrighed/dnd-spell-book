import { useEffect, useRef, type ReactNode } from 'react'
import { bookmarkViewId, type BookmarkId } from '../utils/bookmarks'

interface BookmarkViewProps {
  id: BookmarkId
  /** Vue visible. Fermee : masquee par `hidden`, mais toujours montee. */
  open: boolean
  /** Contenu du titre (h2), bilingue comme le reste de l'interface. */
  title: ReactNode
  /** Bouton Fermer et touche Escape. Le retour du focus au marque-page est fait par l'appelant. */
  onClose: () => void
  children: ReactNode
}

/**
 * Coquille d'une vue ouverte par un marque-page, affichee par-dessus le livre
 * (App.css : .book-zone / .bookmark-view). Toujours montee : garde l'etat des
 * formulaires (renommage en cours, cache des sous-classes) entre deux
 * ouvertures, et la cible de aria-controls existe toujours.
 * Escape ecoute sur la vue et pas sur document : Escape dans la recherche
 * doit seulement vider le champ, pas fermer la vue.
 */
export function BookmarkView({ id, open, title, onClose, children }: BookmarkViewProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const titleId = `${bookmarkViewId(id)}-title`

  // A l'ouverture, le focus entre dans la vue (sur le titre).
  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])

  return (
    <section
      id={bookmarkViewId(id)}
      className="bookmark-view"
      role="dialog"
      aria-labelledby={titleId}
      hidden={!open}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
        }
      }}
    >
      <h2 id={titleId} ref={titleRef} tabIndex={-1}>
        {title}
      </h2>
      <button type="button" className="bookmark-view-close" onClick={onClose}>
        Fermer <em>Close</em>
      </button>
      {children}
    </section>
  )
}
