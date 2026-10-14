import type { SpellListItem } from '../api/spells'
import { BROWSER_LANGUAGE, spellDisplayName } from './browserLanguage'

export type SortMode = 'alpha' | 'level'

export const DEFAULT_SORT_MODE: SortMode = 'alpha'

type SortableSpell = Pick<SpellListItem, 'index' | 'name' | 'nameFr' | 'level'>

// Collator cree une fois : comparaison dans la langue du navigateur (accents :
// "Eau" avant "Eclair" en francais).
const collator = new Intl.Collator(BROWSER_LANGUAGE)

/** Nom affiche, puis index en dernier recours : ordre toujours deterministe. */
function compareByName(a: SortableSpell, b: SortableSpell): number {
  return (
    collator.compare(spellDisplayName(a), spellDisplayName(b)) ||
    (a.index < b.index ? -1 : a.index > b.index ? 1 : 0)
  )
}

/**
 * Renvoie une COPIE triee, le tableau d'entree n'est jamais modifie.
 * Niveau : tours de magie (0) en tete, a niveau egal ordre alphabetique.
 */
export function sortSpells<T extends SortableSpell>(spells: readonly T[], mode: SortMode): T[] {
  const compare =
    mode === 'level' ? (a: T, b: T) => a.level - b.level || compareByName(a, b) : compareByName
  return [...spells].sort(compare)
}
