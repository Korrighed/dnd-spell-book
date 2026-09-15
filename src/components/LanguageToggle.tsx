import type { LanguageMode } from '../types/language'

interface LanguageToggleProps {
  value: LanguageMode
  onChange: (value: LanguageMode) => void
}

const OPTIONS: { mode: LanguageMode; label: string }[] = [
  { mode: 'fr', label: 'FR' },
  { mode: 'en', label: 'EN' },
  { mode: 'both', label: 'FR+EN' },
]

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <div className="language-toggle">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          aria-pressed={value === option.mode}
          onClick={() => onChange(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
