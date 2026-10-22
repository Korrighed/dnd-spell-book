import { fetchSpellDetail, type SpellDetail } from './spellDetail'

export interface SpellSummary {
  /** "8d6 Feu", ou `null` sans degats chiffres. */
  damageFr: string | null
  damageEn: string | null
  /** "DEX", ou `null`. */
  saveAbility: string | null
  rangeFr: string
  rangeEn: string
  /** Forme de zone, ou "Cible unique" / "Personnel" sans aire d'effet. */
  shapeFr: string
  shapeEn: string
}

/** `area_of_effect.type` n'est jamais traduit par l'API. */
export const AOE_LABELS_FR: Record<string, string> = {
  sphere: 'Sphère',
  cone: 'Cône',
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

/** Sans aire d'effet : cible unique, ou personnel si la portee est "Self". */
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
  // Cote anglais, repli sur l'index du type de degats ("fire" -> "Fire").
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
