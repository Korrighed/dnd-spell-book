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

/**
 * Coquille d'une vue ouverte par un marque-page, affichee par-dessus le livre
 * (App.css : .book-zone / .bookmark-view). Toujours montee : garde l'etat des
 * formulaires (renommage en cours, cache des sous-classes) entre deux
 * ouvertures, et la cible de aria-controls existe toujours.
 * Escape ecoute sur la vue et pas sur document : Escape dans la recherche
 * doit seulement vider le champ, pas fermer la vue.
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

  return (
    <section
      id={bookmarkViewId(id)}
      className={className ? `bookmark-view ${className}` : 'bookmark-view'}
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
