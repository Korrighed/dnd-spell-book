import type { LanguageMode } from '../types/language'

/** Ratios de jeu de l'API, pas de conversion physique. */
const METERS_PER_FOOT = 0.3
const KM_PER_MILE = 1.5

function formatNumber(value: number, mode: LanguageMode): string {
  return value.toLocaleString(mode === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 })
}

/** Les deux unites, celle de la langue d'abord : « 6 m (20 ft) » ou « 20 ft (6 m) ». */
function bothUnits(metric: string, imperial: string, mode: LanguageMode): string {
  return mode === 'fr' ? `${metric} (${imperial})` : `${imperial} (${metric})`
}

/** Distance en pieds (taille de zone d'effet), dans les deux unites. */
export function formatFeet(feet: number, mode: LanguageMode): string {
  return bothUnits(
    `${formatNumber(feet * METERS_PER_FOOT, mode)} m`,
    `${formatNumber(feet, mode)} ft`,
    mode,
  )
}

/**
 * Portee dans les deux unites, lue sur le texte anglais (« 60 feet », « 1 mile »).
 * Sans distance (Self, Touch...) : texte de l'API dans la langue choisie.
 */
export function formatRange(rangeEn: string, rangeFr: string, mode: LanguageMode): string {
  const feet = /^(\d+) feet$/.exec(rangeEn)
  if (feet) return formatFeet(Number(feet[1]), mode)

  const miles = /^(\d+) miles?$/.exec(rangeEn)
  if (miles) {
    const count = Number(miles[1])
    return bothUnits(
      `${formatNumber(count * KM_PER_MILE, mode)} km`,
      `${formatNumber(count, mode)} ${count > 1 ? 'miles' : 'mile'}`,
      mode,
    )
  }

  return mode === 'fr' ? rangeFr : rangeEn
}
