/** Langue de l'interface, deduite du navigateur. La fiche de sort a sa propre bascule FR / EN. */
export type BrowserLanguage = 'fr' | 'en'

export function detectBrowserLanguage(): BrowserLanguage {
  const lang = navigator.language ?? navigator.languages?.[0] ?? 'en'
  return lang.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

/** Lue une seule fois : source commune de l'affichage et du tri. */
export const BROWSER_LANGUAGE: BrowserLanguage = detectBrowserLanguage()

/** Texte d'interface dans la langue du navigateur. */
export function t(fr: string, en: string): string {
  return BROWSER_LANGUAGE === 'fr' ? fr : en
}

/** Nom d'un sort dans la langue du navigateur. */
export function spellDisplayName(spell: { name: string; nameFr: string }): string {
  return BROWSER_LANGUAGE === 'fr' ? spell.nameFr : spell.name
}
