const BASE_URL = 'https://www.dnd5eapi.co/api/2014'

interface RawRef {
  index: string
  name: string
  url: string
}

interface RawDamage {
  /** Absent sur les sorts a degats sans type : `sleep`, `prismatic-spray`. */
  damage_type?: RawRef
  damage_at_slot_level?: Record<string, string>
  damage_at_character_level?: Record<string, string>
}

/**
 * Forme brute d'un sort. `/spells/{index}` et `/spells/{index}?lang=fr-FR` renvoient
 * la meme structure, a une exception mesuree sur les 319 sorts du catalogue :
 * `damage` n'est renvoye que par la version fr-FR, et sous forme de tableau.
 * Aucun autre champ present en anglais ne manque en francais.
 */
interface RawSpell {
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
  damage?: RawDamage[]
  dc?: {
    dc_type: RawRef
    dc_success: string
  }
  area_of_effect?: {
    type: string
    size: number
  }
  school: RawRef
  classes: RawRef[]
  updated_at: string
}

/** Champs traduits. Meme forme quelle que soit la langue du payload d'origine. */
export interface SpellTexts {
  name: string
  desc: string[]
  higherLevel: string[]
  range: string
  material: string | null
  duration: string
  castingTime: string
  school: string
  classes: string[]
  /** Seul le payload fr-FR porte le nom du type de degats. `null` cote anglais. */
  damageTypeName: string | null
  dcType: string | null
}

/** Champs identiques dans les deux langues. Lus une seule fois. */
export interface SpellMechanics {
  index: string
  level: number
  ritual: boolean
  concentration: boolean
  components: string[]
  areaOfEffect: {
    type: string
    sizeFeet: number
    sizeMeters: number
  } | null
  damage: {
    typeIndex: string | null
    atSlotLevel: Record<string, string> | null
  } | null
  dcSuccess: string | null
  updatedAt: string
}

export interface SpellDetail {
  mechanics: SpellMechanics
  en: SpellTexts
  fr: SpellTexts
}

/**
 * Conversion de jeu, pas de conversion physique : D&D compte 1 case = 5 ft = 1,50 m,
 * soit un ratio de 0,3. C'est celui qu'applique l'API dans ses traductions fr-FR
 * (30 ft -> 9 metres, 120 ft -> 36 metres). Utiliser 0,3048 afficherait 6,1 m
 * la ou le reste de la fiche francaise annonce 6 m.
 *
 * `area_of_effect.size` est en pieds dans les deux langues : il faut donc toujours convertir.
 */
function feetToMeters(feet: number): number {
  return Math.round(feet * 0.3 * 100) / 100
}

function parseTexts(raw: RawSpell): SpellTexts {
  return {
    name: raw.name,
    desc: raw.desc,
    higherLevel: raw.higher_level ?? [],
    range: raw.range,
    material: raw.material ?? null,
    duration: raw.duration,
    castingTime: raw.casting_time,
    school: raw.school.name,
    classes: raw.classes.map((cls) => cls.name),
    damageTypeName: raw.damage?.[0]?.damage_type?.name ?? null,
    dcType: raw.dc?.dc_type.name ?? null,
  }
}

function parseMechanics(raw: RawSpell): Omit<SpellMechanics, 'damage'> {
  return {
    index: raw.index,
    level: raw.level,
    ritual: raw.ritual,
    concentration: raw.concentration,
    components: raw.components,
    areaOfEffect: raw.area_of_effect
      ? {
          type: raw.area_of_effect.type,
          sizeFeet: raw.area_of_effect.size,
          sizeMeters: feetToMeters(raw.area_of_effect.size),
        }
      : null,
    dcSuccess: raw.dc?.dc_success ?? null,
    updatedAt: raw.updated_at,
  }
}

function parseDamage(raw: RawSpell): SpellMechanics['damage'] {
  const damage = raw.damage?.[0]
  if (!damage) return null

  return {
    typeIndex: damage.damage_type?.index ?? null,
    atSlotLevel: damage.damage_at_slot_level ?? damage.damage_at_character_level ?? null,
  }
}

/**
 * La langue est toujours explicite, anglais compris : sans parametre `lang`, l'API
 * repond selon l'en-tete `Accept-Language`. Depuis un navigateur configure en francais,
 * l'endpoint nu renvoyait donc du francais des deux cotes, et le basculement FR/EN
 * affichait deux fois le meme texte.
 */
async function fetchRaw(index: string, lang: 'en' | 'fr-FR'): Promise<RawSpell> {
  const res = await fetch(`${BASE_URL}/spells/${index}?lang=${lang}`)

  if (!res.ok) {
    throw new Error('Impossible de charger le detail du sort. (Unable to load the spell detail.)')
  }

  return (await res.json()) as RawSpell
}

export async function fetchSpellDetail(index: string): Promise<SpellDetail> {
  const [en, fr] = await Promise.all([fetchRaw(index, 'en'), fetchRaw(index, 'fr-FR')])

  return {
    // Les degats ne sont exposes que par le payload fr-FR, d'ou cette seule lecture croisee.
    mechanics: { ...parseMechanics(en), damage: parseDamage(fr) },
    en: parseTexts(en),
    fr: parseTexts(fr),
  }
}
