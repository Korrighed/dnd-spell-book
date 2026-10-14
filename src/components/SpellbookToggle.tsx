import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { t } from '../utils/browserLanguage'

interface SpellbookToggleProps {
  inSpellbook: boolean
  onToggle: () => void
}

/** Duree d'appui avant d'afficher l'infobulle (ms). */
const LONG_PRESS_MS = 450

function iconStyle(file: string): CSSProperties {
  return { '--icon': `url(${import.meta.env.BASE_URL}icons/${file})` } as CSSProperties
}

/**
 * Bouton compact d'ajout/retrait au grimoire personnel : icone grimoire + « + »
 * ou « - ». Le libelle complet est dans aria-label (lecteur d'ecran) et title
 * (survol souris), et s'affiche en infobulle sur un appui maintenu (tactile,
 * ou clic maintenu). Un appui maintenu sert a lire l'infobulle : le relacher
 * ne declenche pas l'action. Clavier (Entree / Espace) : action directe.
 */
export function SpellbookToggle({ inSpellbook, onToggle }: SpellbookToggleProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const timerRef = useRef<number | null>(null)
  // Vrai si l'appui en cours a affiche l'infobulle : le clic qui suit est ignore.
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

  // Timer encore en attente au demontage (changement de sort pendant l'appui).
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
        // Appui long en mobile : pas de menu contextuel par-dessus l'infobulle.
        onContextMenu={(event) => event.preventDefault()}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false
            return
          }
          onToggle()
        }}
      >
        <span className="spellbook-toggle-icon" aria-hidden="true" style={iconStyle('favourite-book.svg')} />
        <span
          className="spellbook-toggle-sign"
          aria-hidden="true"
          style={iconStyle(inSpellbook ? 'minus.svg' : 'plus.svg')}
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
