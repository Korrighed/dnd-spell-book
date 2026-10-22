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
  openView: BookmarkId | null
  onToggle: (id: BookmarkId) => void
}

const BOOKMARKS: Record<TabBookmarkId, { icon: string; label: string }> = {
  filters: { icon: 'funnel.svg', label: t('Filtres et tri', 'Filters and sort') },
  character: { icon: 'user-round-cog.svg', label: t('Personnage', 'Character') },
  spellbook: { icon: 'book-heart.svg', label: t('Grimoire personnel', 'Personal spellbook') },
}

/** Rangee de marque-pages, chacun lie a sa vue (aria-expanded, aria-controls). */
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
