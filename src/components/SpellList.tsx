import type { SpellListItem } from '../api/spells'
import type { SpellAccessCheck } from '../hooks/useSpellAccess'
import { OutOfProfileLabel } from './OutOfProfileLabel'
import './SpellList.css'

interface SpellListProps {
  spells: SpellListItem[]
  onSelect: (index: string) => void
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
}

export function SpellList({ spells, onSelect, isAccessible }: SpellListProps) {
  return (
    <ul className="spell-list">
      {spells.map((spell) => {
        const outOfProfile = isAccessible !== null && !isAccessible(spell.index, spell.level)

        return (
          <li key={spell.index} className={outOfProfile ? 'out-of-profile' : undefined}>
            <button type="button" onClick={() => onSelect(spell.index)}>
              <span className="level">Niv. {spell.level}</span>
              <span className="name-fr">{spell.nameFr}</span>
              <span className="name-en">{spell.name}</span>
              {outOfProfile && <OutOfProfileLabel />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
