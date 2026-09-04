import type { SpellListItem } from '../api/spells'
import './SpellList.css'

interface SpellListProps {
  spells: SpellListItem[]
}

export function SpellList({ spells }: SpellListProps) {
  return (
    <ul className="spell-list">
      {spells.map((spell) => (
        <li key={spell.index}>
          <span className="level">Niv. {spell.level}</span>
          <span className="name-fr">{spell.nameFr}</span>
          <span className="name-en">{spell.name}</span>
        </li>
      ))}
    </ul>
  )
}
