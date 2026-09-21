import { fetchSpellDetail, type SpellDetail } from './spellDetail'

export interface SpellSummary {
  /** "8d6 Feu", ou `null` si le sort n'inflige pas de degats chiffres. */
  damage: string | null
  /** Abreviation de la caracteristique du jet de sauvegarde ("DEX"), ou `null`. */
  saveAbility: string | null
  rangeFr: string
  rangeEn: string
  /** Forme de zone (FR) : "Sphere", "Cone"... ou "Cible unique" / "Personnel" a defaut d'aire d'effet. */
  shapeFr: string
}

/**
 * Traduction manuelle : `area_of_effect.type` n'est jamais localise par l'API,
 * meme sur le payload fr-FR (verifie sur `fireball`).
 */
const AOE_LABELS_FR: Record<string, string> = {
  sphere: 'Sphere',
  cone: 'Cone',
  cylinder: 'Cylindre',
  line: 'Ligne',
  cube: 'Cube',
}

function firstDamageValue(atSlotLevel: Record<string, string> | null): string | null {
  if (!atSlotLevel) return null
  return Object.values(atSlotLevel)[0] ?? null
}

/**
 * Sans aire d'effet, le sort cible normalement une seule creature/objet. Exception
 * courante : les sorts sur soi ("Self" / "Personnelle"), distingues via la portee.
 */
function shapeLabel(detail: SpellDetail): string {
  const { areaOfEffect } = detail.mechanics
  if (areaOfEffect) return AOE_LABELS_FR[areaOfEffect.type] ?? areaOfEffect.type

  return detail.en.range === 'Self' ? 'Personnel' : 'Cible unique'
}

export function summarizeSpell(detail: SpellDetail): SpellSummary {
  const { mechanics, fr, en } = detail
  const damageValue = mechanics.damage ? firstDamageValue(mechanics.damage.atSlotLevel) : null

  return {
    damage:
      damageValue && fr.damageTypeName
        ? `${damageValue} ${fr.damageTypeName}`
        : damageValue,
    saveAbility: en.dcType,
    rangeFr: fr.range,
    rangeEn: en.range,
    shapeFr: shapeLabel(detail),
  }
}

export async function fetchSpellSummary(index: string): Promise<SpellSummary> {
  const detail = await fetchSpellDetail(index)
  return summarizeSpell(detail)
}
