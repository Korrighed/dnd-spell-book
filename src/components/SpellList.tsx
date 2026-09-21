import type { SpellSummary } from '../api/spellSummary'
import type { SpellListItem } from '../api/spells'
import type { SpellAccessCheck } from '../utils/spellAccess'
import { OutOfProfileLabel } from './OutOfProfileLabel'
import './SpellList.css'

interface SpellListProps {
  spells: SpellListItem[]
  onSelect: (index: string) => void
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
  /** Degats / JS / portee / forme, remplis en tache de fond. Absent tant que non charge. */
  summaries: Record<string, SpellSummary>
}

export function SpellList({ spells, onSelect, isAccessible, summaries }: SpellListProps) {
  return (
    <ul className="spell-list">
      {spells.map((spell) => {
        const outOfProfile = isAccessible !== null && !isAccessible(spell.index, spell.level)
        const summary = summaries[spell.index]

        return (
          <li key={spell.index} className={outOfProfile ? 'out-of-profile' : undefined}>
            <button type="button" onClick={() => onSelect(spell.index)}>
              <span className="level">Niv. {spell.level}</span>
              <span className="name-fr">{spell.nameFr}</span>
              <span className="name-en">{spell.name}</span>
              <span className="extra">
                {summary ? (
                  <>
                    {summary.damage && <span className="damage">{summary.damage}</span>}
                    {summary.saveAbility && <span className="save">JS {summary.saveAbility}</span>}
                    <span className="range">
                      {summary.rangeFr} <span className="range-en">({summary.rangeEn})</span>
                    </span>
                    <span className="shape">{summary.shapeFr}</span>
                  </>
                ) : (
                  <span className="loading">…</span>
                )}
              </span>
              {outOfProfile && <OutOfProfileLabel />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
