/**
 * Vues ouvrables : trois par un marque-page (le tri est regroupe avec les
 * filtres, vue « filters »), plus l'aide, ouverte par le bouton « ? » du
 * header. Toutes partagent la meme coquille (BookmarkView) et le meme etat
 * openView dans App.
 */
export type BookmarkId = 'filters' | 'character' | 'spellbook' | 'help'

/** Les vues qui ont un onglet marque-page (l'aide a son propre bouton). */
export type TabBookmarkId = Exclude<BookmarkId, 'help'>

export const BOOKMARK_IDS: readonly TabBookmarkId[] = ['filters', 'character', 'spellbook']

/** Id du bouton qui ouvre la vue : sert a lui rendre le focus a la fermeture. */
export function bookmarkButtonId(id: BookmarkId): string {
  return `bookmark-${id}`
}

/** Id de la vue : cible de aria-controls sur le bouton qui l'ouvre. */
export function bookmarkViewId(id: BookmarkId): string {
  return `bookmark-view-${id}`
}
