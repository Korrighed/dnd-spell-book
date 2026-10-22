/** Vues ouvrables : trois par un marque-page, plus l'aide (bouton « ? »). */
export type BookmarkId = 'filters' | 'character' | 'spellbook' | 'help'

export type TabBookmarkId = Exclude<BookmarkId, 'help'>

export const BOOKMARK_IDS: readonly TabBookmarkId[] = ['filters', 'character', 'spellbook']

export function bookmarkButtonId(id: BookmarkId): string {
  return `bookmark-${id}`
}

export function bookmarkViewId(id: BookmarkId): string {
  return `bookmark-view-${id}`
}
