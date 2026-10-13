/** Les quatre vues ouvrables par un marque-page. */
export type BookmarkId = 'filters' | 'sort' | 'character' | 'spellbook'

export const BOOKMARK_IDS: readonly BookmarkId[] = ['filters', 'sort', 'character', 'spellbook']

/** Id du bouton marque-page : sert a lui rendre le focus a la fermeture de la vue. */
export function bookmarkButtonId(id: BookmarkId): string {
  return `bookmark-${id}`
}

/** Id de la vue : cible de aria-controls sur le marque-page. */
export function bookmarkViewId(id: BookmarkId): string {
  return `bookmark-view-${id}`
}
