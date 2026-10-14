import {
  BOOKMARK_IDS,
  bookmarkButtonId,
  bookmarkViewId,
  type BookmarkId,
} from '../utils/bookmarks'
import { t } from '../utils/browserLanguage'

interface BookmarksProps {
  /** Vue actuellement ouverte, `null` si aucune. */
  openView: BookmarkId | null
  /** Clic sur un marque-page : l'appelant ouvre la vue, ou la ferme si elle est deja ouverte. */
  onToggle: (id: BookmarkId) => void
}

const BOOKMARKS: Record<BookmarkId, { icon: string; label: string }> = {
  filters: { icon: 'funnel.svg', label: t('Filtres', 'Filters') },
  sort: { icon: 'arrow-up-1-0.svg', label: t('Tri', 'Sort') },
  character: { icon: 'user-round-cog.svg', label: t('Personnage', 'Character') },
  spellbook: { icon: 'favourite-book.svg', label: t('Grimoire personnel', 'Personal spellbook') },
}

/**
 * Rangee de quatre marque-pages, identiques sur desktop et mobile.
 * aria-expanded : la vue liee est ouverte. aria-controls : id de cette vue
 * (toujours presente dans le DOM, masquee par `hidden`).
 * Aucun style ici : position, forme et couleur viendront dans la branche CSS.
 */
export function Bookmarks({ openView, onToggle }: BookmarksProps) {
  return (
    <div className="bookmarks">
      {BOOKMARK_IDS.map((id) => {
        const { icon, label } = BOOKMARKS[id]

        return (
          <button
            key={id}
            id={bookmarkButtonId(id)}
            type="button"
            className="bookmark"
            aria-label={label}
            title={label}
            aria-expanded={openView === id}
            aria-controls={bookmarkViewId(id)}
            onClick={() => onToggle(id)}
          >
            <img src={`${import.meta.env.BASE_URL}icons/${icon}`} alt="" draggable={false} />
          </button>
        )
      })}
    </div>
  )
}
