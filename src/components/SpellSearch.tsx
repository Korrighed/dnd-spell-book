import type { CSSProperties } from 'react'
import { t } from '../utils/browserLanguage'

interface SpellSearchProps {
  value: string
  onChange: (value: string) => void
}

export function SpellSearch({ value, onChange }: SpellSearchProps) {
  return (
    <div className="spell-search">
      {/* aria-label : le placeholder seul n'est pas un nom accessible fiable. */}
      <input
        type="search"
        aria-label={t('Rechercher un sort', 'Search a spell')}
        placeholder={t('Rechercher un sort…', 'Search a spell…')}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span
        className="spell-search-icon"
        aria-hidden="true"
        style={
          { '--icon': `url(${import.meta.env.BASE_URL}icons/book-search.svg)` } as CSSProperties
        }
      />
    </div>
  )
}
