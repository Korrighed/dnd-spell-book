const BASE_URL = 'https://www.dnd5eapi.co/api/2014'

interface RawApiRef {
  index: string
  name: string
  url: string
}

interface RawSpellDetail {
  index: string
  name: string
  desc: string[]
  higher_level?: string[]
  range: string
  components: string[]
  material?: string
  ritual: boolean
  duration: string
  concentration: boolean
  casting_time: string
  level: number
  damage?: {
    damage_type: RawApiRef
    damage_at_slot_level?: Record<string, string>
    damage_at_character_level?: Record<string, string>
  }
  dc?: {
    dc_type: RawApiRef
    dc_success: string
  }
  area_of_effect?: {
    type: string
    size: number
  }
  school: RawApiRef
  classes: RawApiRef[]
  url: string
  updated_at: string
}

export interface SpellDetail {
  index: string
  name: string
  nameFr: string
  desc: string[]
  descFr: string[]
  higherLevel: string[]
  higherLevelFr: string[]
  range: string
  rangeFr: string
  components: string[]
  material: string | null
  materialFr: string | null
  ritual: boolean
  duration: string
  durationFr: string
  concentration: boolean
  castingTime: string
  castingTimeFr: string
  level: number
  damage: {
    typeName: string
    typeNameFr: string
    atSlotLevel: Record<string, string> | null
  } | null
  dc: {
    typeName: string
    typeNameFr: string
    success: string
  } | null
  areaOfEffect: {
    type: string
    sizeFeet: number
    sizeMeters: number
  } | null
  school: string
  schoolFr: string
  classes: string[]
  classesFr: string[]
  updatedAt: string
}

function feetToMeters(feet: number): number {
  return Math.round(feet * 0.3048 * 100) / 100
}

export async function fetchSpellDetail(index: string): Promise<SpellDetail> {
  const [enRes, frRes] = await Promise.all([
    fetch(`${BASE_URL}/spells/${index}`),
    fetch(`${BASE_URL}/spells/${index}?lang=fr-FR`),
  ])

  if (!enRes.ok || !frRes.ok) {
    throw new Error(
      'Impossible de charger le detail du sort. (Unable to load the spell detail.)',
    )
  }

  const [en, fr] = (await Promise.all([enRes.json(), frRes.json()])) as [
    RawSpellDetail,
    RawSpellDetail,
  ]

  return {
    index: en.index,
    name: en.name,
    nameFr: fr.name,
    desc: en.desc,
    descFr: fr.desc,
    higherLevel: en.higher_level ?? [],
    higherLevelFr: fr.higher_level ?? [],
    range: en.range,
    rangeFr: fr.range,
    components: en.components,
    material: en.material ?? null,
    materialFr: fr.material ?? null,
    ritual: en.ritual,
    duration: en.duration,
    durationFr: fr.duration,
    concentration: en.concentration,
    castingTime: en.casting_time,
    castingTimeFr: fr.casting_time,
    level: en.level,
    damage: en.damage
      ? {
          typeName: en.damage.damage_type.name,
          typeNameFr: fr.damage?.damage_type.name ?? en.damage.damage_type.name,
          atSlotLevel: en.damage.damage_at_slot_level ?? en.damage.damage_at_character_level ?? null,
        }
      : null,
    dc: en.dc
      ? {
          typeName: en.dc.dc_type.name,
          typeNameFr: fr.dc?.dc_type.name ?? en.dc.dc_type.name,
          success: en.dc.dc_success,
        }
      : null,
    areaOfEffect: en.area_of_effect
      ? {
          type: en.area_of_effect.type,
          sizeFeet: en.area_of_effect.size,
          sizeMeters: feetToMeters(en.area_of_effect.size),
        }
      : null,
    school: en.school.name,
    schoolFr: fr.school.name,
    classes: en.classes.map((cls) => cls.name),
    classesFr: fr.classes.map((cls) => cls.name),
    updatedAt: en.updated_at,
  }
}
