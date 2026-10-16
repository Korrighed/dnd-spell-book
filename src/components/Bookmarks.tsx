import type { CSSProperties } from 'react'
import {
  BOOKMARK_IDS,
  bookmarkButtonId,
  bookmarkViewId,
  type BookmarkId,
  type TabBookmarkId,
} from '../utils/bookmarks'
import { t } from '../utils/browserLanguage'

interface BookmarksProps {
  /** Vue actuellement ouverte, `null` si aucune. */
  openView: BookmarkId | null
  /** Clic sur un marque-page : l'appelant ouvre la vue, ou la ferme si elle est deja ouverte. */
  onToggle: (id: BookmarkId) => void
}

const BOOKMARKS: Record<TabBookmarkId, { icon: string; label: string }> = {
  filters: { icon: 'funnel.svg', label: t('Filtres et tri', 'Filters and sort') },
  character: { icon: 'user-round-cog.svg', label: t('Personnage', 'Character') },
  spellbook: { icon: 'book-heart.svg', label: t('Grimoire personnel', 'Personal spellbook') },
}

/**
 * Rangee de trois marque-pages, identiques sur desktop et mobile.
 * aria-expanded : la vue liee est ouverte. aria-controls : id de cette vue
 * (toujours presente dans le DOM, masquee par `hidden`).
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
            {/* Icone en masque CSS (App.css, .bookmark-icon) plutot qu'en <img> :
                elle prend la couleur du texte (currentColor), donc le Tan de
                la charte sur le Caput Mortuum de l'onglet. */}
            <span
              className="bookmark-icon"
              aria-hidden="true"
              style={
                {
                  '--icon': `url(${import.meta.env.BASE_URL}icons/${icon})`,
                } as CSSProperties
              }
            />
          </button>
        )
      })}
    </div>
  )
}
