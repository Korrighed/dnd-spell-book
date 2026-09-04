const LEVELS = Array.from({ length: 10 }, (_, index) => index)

interface SpellLevelFilterProps {
  value: number | null
  onChange: (value: number | null) => void
}

export function SpellLevelFilter({ value, onChange }: SpellLevelFilterProps) {
  return (
    <select
      value={value ?? 'all'}
      onChange={(event) => {
        const raw = event.target.value
        onChange(raw === 'all' ? null : Number(raw))
      }}
    >
      <option value="all">Tous les niveaux</option>
      {LEVELS.map((level) => (
        <option key={level} value={level}>
          {level === 0 ? 'Tour de magie' : `Niveau ${level}`}
        </option>
      ))}
    </select>
  )
}
