import type { SchoolListItem } from '../api/schools'

interface SpellSchoolFilterProps {
  schools: SchoolListItem[]
  value: string | null
  onChange: (value: string | null) => void
}

export function SpellSchoolFilter({ schools, value, onChange }: SpellSchoolFilterProps) {
  return (
    <select
      value={value ?? 'all'}
      onChange={(event) => {
        const raw = event.target.value
        onChange(raw === 'all' ? null : raw)
      }}
    >
      <option value="all">Toutes les ecoles (All schools)</option>
      {schools.map((school) => (
        <option key={school.index} value={school.index}>
          {school.nameFr} ({school.name})
        </option>
      ))}
    </select>
  )
}
