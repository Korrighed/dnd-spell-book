import type { SpellListItem } from '../api/spells'
import './SpellList.css'

interface SpellListProps {
  spells: SpellListItem[]
  onSelect: (index: string) => void
}

export function SpellList({ spells, onSelect }: SpellListProps) {
  return (
    <ul className="spell-list">
      {spells.map((spell) => (
        <li key={spell.index}>
          <button type="button" onClick={() => onSelect(spell.index)}>
            <span className="level">Niv. {spell.level}</span>
            <span className="name-fr">{spell.nameFr}</span>
            <span className="name-en">{spell.name}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
