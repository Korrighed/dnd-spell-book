import { t } from '../utils/browserLanguage'

const LEVELS = Array.from({ length: 10 }, (_, index) => index)

function levelLabel(level: number): string {
  return level === 0 ? t('Tour de magie', 'Cantrip') : t(`Niveau ${level}`, `Level ${level}`)
}

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
      <option value="all">{t('Tous les niveaux', 'All levels')}</option>
      {LEVELS.map((level) => (
        <option key={level} value={level}>
          {levelLabel(level)}
        </option>
      ))}
    </select>
  )
}
