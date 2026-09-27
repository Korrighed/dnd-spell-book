import { fetchSpellDetail, type SpellDetail } from './spellDetail'

export interface SpellSummary {
  /** "8d6 Feu", ou `null` si le sort n'inflige pas de degats chiffres. */
  damageFr: string | null
  /** "8d6 Fire", ou `null` si le sort n'inflige pas de degats chiffres. */
  damageEn: string | null
  /** Abreviation de la caracteristique du jet de sauvegarde ("DEX"), ou `null`. */
  saveAbility: string | null
  rangeFr: string
  rangeEn: string
  /** Forme de zone (FR) : "Sphere", "Cone"... ou "Cible unique" / "Personnel" a defaut d'aire d'effet. */
  shapeFr: string
  /** Forme de zone (EN) : "Sphere", "Cone"... ou "Single target" / "Self" a defaut d'aire d'effet. */
  shapeEn: string
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

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function firstDamageValue(atSlotLevel: Record<string, string> | null): string | null {
  if (!atSlotLevel) return null
  return Object.values(atSlotLevel)[0] ?? null
}

/**
 * Sans aire d'effet, le sort cible normalement une seule creature/objet. Exception
 * courante : les sorts sur soi ("Self" / "Personnelle"), distingues via la portee.
 */
function shapeLabels(detail: SpellDetail): { fr: string; en: string } {
  const { areaOfEffect } = detail.mechanics
  if (areaOfEffect) {
    return {
      fr: AOE_LABELS_FR[areaOfEffect.type] ?? areaOfEffect.type,
      en: capitalize(areaOfEffect.type),
    }
  }

  return detail.en.range === 'Self'
    ? { fr: 'Personnel', en: 'Self' }
    : { fr: 'Cible unique', en: 'Single target' }
}

export function summarizeSpell(detail: SpellDetail): SpellSummary {
  const { mechanics, fr, en } = detail
  const damageValue = mechanics.damage ? firstDamageValue(mechanics.damage.atSlotLevel) : null
  // L'API n'expose le nom du type de degats qu'en fr-FR : cote anglais, repli
  // sur l'index technique capitalise ("fire" -> "Fire"), comme SpellDetail.
  const damageTypeEn =
    en.damageTypeName ??
    (mechanics.damage?.typeIndex ? capitalize(mechanics.damage.typeIndex) : null)
  const shape = shapeLabels(detail)

  return {
    damageFr:
      damageValue && fr.damageTypeName ? `${damageValue} ${fr.damageTypeName}` : damageValue,
    damageEn: damageValue && damageTypeEn ? `${damageValue} ${damageTypeEn}` : damageValue,
    saveAbility: en.dcType,
    rangeFr: fr.range,
    rangeEn: en.range,
    shapeFr: shape.fr,
    shapeEn: shape.en,
  }
}

export async function fetchSpellSummary(index: string): Promise<SpellSummary> {
  const detail = await fetchSpellDetail(index)
  return summarizeSpell(detail)
}
