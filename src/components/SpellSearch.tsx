import { t } from '../utils/browserLanguage'

interface SpellSearchProps {
  value: string
  onChange: (value: string) => void
}

export function SpellSearch({ value, onChange }: SpellSearchProps) {
  return (
    <input
      type="search"
      placeholder={t('Rechercher un sort...', 'Search a spell...')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
