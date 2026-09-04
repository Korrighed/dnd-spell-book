interface SpellSearchProps {
  value: string
  onChange: (value: string) => void
}

export function SpellSearch({ value, onChange }: SpellSearchProps) {
  return (
    <input
      type="search"
      placeholder="Rechercher un sort (FR ou EN)..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
