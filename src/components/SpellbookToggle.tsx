import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { t } from '../utils/browserLanguage'

interface SpellbookToggleProps {
  inSpellbook: boolean
  onToggle: () => void
}

const LONG_PRESS_MS = 450

function iconStyle(file: string): CSSProperties {
  return { '--icon': `url(${import.meta.env.BASE_URL}icons/${file})` } as CSSProperties
}

/**
 * Ajout / retrait au grimoire personnel. Un appui maintenu affiche le libelle
 * en infobulle, sans declencher l'action.
 */
export function SpellbookToggle({ inSpellbook, onToggle }: SpellbookToggleProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const timerRef = useRef<number | null>(null)
  // L'appui a affiche l'infobulle : le clic qui suit est ignore.
  const suppressClickRef = useRef(false)
  const tooltipId = useId()
  const label = inSpellbook
    ? t('Retirer du grimoire personnel', 'Remove from personal spellbook')
    : t('Ajouter au grimoire personnel', 'Add to personal spellbook')

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const endPress = () => {
    clearTimer()
    setTooltipVisible(false)
  }

  return (
    <span className="spellbook-toggle-wrap">
      <button
        type="button"
        className="spellbook-toggle"
        data-in-spellbook={inSpellbook || undefined}
        aria-label={label}
        aria-describedby={tooltipVisible ? tooltipId : undefined}
        title={label}
        onPointerDown={() => {
          suppressClickRef.current = false
          clearTimer()
          timerRef.current = window.setTimeout(() => {
            suppressClickRef.current = true
            setTooltipVisible(true)
          }, LONG_PRESS_MS)
        }}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        onPointerCancel={endPress}
        onContextMenu={(event) => event.preventDefault()}
        onClick={(event) => {
          // detail === 0 : clavier (Entree / Espace), qui agit toujours.
          const fromKeyboard = event.detail === 0
          const suppress = suppressClickRef.current && !fromKeyboard
          suppressClickRef.current = false
          if (suppress) return
          onToggle()
        }}
      >
        <span
          className="spellbook-toggle-icon"
          aria-hidden="true"
          style={iconStyle(inSpellbook ? 'book-minus.svg' : 'book-plus.svg')}
        />
      </button>
      {tooltipVisible && (
        <span id={tooltipId} role="tooltip" className="spellbook-tooltip">
          {label}
        </span>
      )}
    </span>
  )
}
