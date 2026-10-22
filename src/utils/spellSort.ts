import type { SpellListItem } from '../api/spells'
import { BROWSER_LANGUAGE, spellDisplayName } from './browserLanguage'

export type SortMode = 'alpha' | 'level'

export const DEFAULT_SORT_MODE: SortMode = 'alpha'

type SortableSpell = Pick<SpellListItem, 'index' | 'name' | 'nameFr' | 'level'>

// Comparaison dans la langue du navigateur, accents compris.
const collator = new Intl.Collator(BROWSER_LANGUAGE)

function compareByName(a: SortableSpell, b: SortableSpell): number {
  return (
    collator.compare(spellDisplayName(a), spellDisplayName(b)) ||
    (a.index < b.index ? -1 : a.index > b.index ? 1 : 0)
  )
}

/** Copie triee. Par niveau : a niveau egal, ordre alphabetique. */
export function sortSpells<T extends SortableSpell>(spells: readonly T[], mode: SortMode): T[] {
  const compare =
    mode === 'level' ? (a: T, b: T) => a.level - b.level || compareByName(a, b) : compareByName
  return [...spells].sort(compare)
}
