/**
 * Langue d'affichage deduite du navigateur, pour les endroits ou une seule
 * langue doit s'afficher (pas de melange FR/EN) : la liste des sorts, par
 * exemple. Le toggle FR/EN/FR+EN explicite reste propre a SpellDetail.
 */
export type BrowserLanguage = 'fr' | 'en'

export function detectBrowserLanguage(): BrowserLanguage {
  const lang = navigator.language ?? navigator.languages?.[0] ?? 'en'
  return lang.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}
