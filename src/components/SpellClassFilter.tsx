import type { ClassListItem } from '../api/classes'

interface SpellClassFilterProps {
  classes: ClassListItem[]
  value: string | null
  onChange: (value: string | null) => void
}

export function SpellClassFilter({ classes, value, onChange }: SpellClassFilterProps) {
  return (
    <select
      value={value ?? 'all'}
      onChange={(event) => {
        const raw = event.target.value
        onChange(raw === 'all' ? null : raw)
      }}
    >
      <option value="all">Toutes les classes (All classes)</option>
      {classes.map((cls) => (
        <option key={cls.index} value={cls.index}>
          {cls.nameFr} ({cls.name})
        </option>
      ))}
    </select>
  )
}
