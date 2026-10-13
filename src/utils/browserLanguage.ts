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

/**
 * Langue du navigateur, lue une seule fois : elle ne change pas pendant la
 * vie de l'application. Source unique pour l'affichage (SpellList,
 * PersonalSpellbookPanel) et le tri (spellSort), pour qu'ils restent d'accord.
 */
export const BROWSER_LANGUAGE: BrowserLanguage = detectBrowserLanguage()

/** Nom d'un sort dans la langue du navigateur (nameFr retombe deja sur name, voir api/spells.ts). */
export function spellDisplayName(spell: { name: string; nameFr: string }): string {
  return BROWSER_LANGUAGE === 'fr' ? spell.nameFr : spell.name
}
