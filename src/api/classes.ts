const BASE_URL = 'https://www.dnd5eapi.co/api/2014'

/** Langue explicite obligatoire : sans `lang`, l'API suit l'en-tete `Accept-Language`. */
const EN = '?lang=en'
const FR = '?lang=fr-FR'

export interface ClassListItem {
  index: string
  name: string
  nameFr: string
  url: string
}

interface RawClassListResult {
  index: string
  name: string
  url: string
}

interface RawClassListResponse {
  count: number
  results: RawClassListResult[]
}

export async function fetchClassList(): Promise<ClassListItem[]> {
  const [enRes, frRes] = await Promise.all([
    fetch(`${BASE_URL}/classes${EN}`),
    fetch(`${BASE_URL}/classes${FR}`),
  ])

  if (!enRes.ok || !frRes.ok) {
    throw new Error(
      'Impossible de charger la liste des classes depuis l\'API. (Unable to load the class list from the API.)',
    )
  }

  const [en, fr] = (await Promise.all([enRes.json(), frRes.json()])) as [
    RawClassListResponse,
    RawClassListResponse,
  ]

  const frNameByIndex = new Map(fr.results.map((cls) => [cls.index, cls.name]))

  return en.results.map((cls) => ({
    index: cls.index,
    name: cls.name,
    nameFr: frNameByIndex.get(cls.index) ?? cls.name,
    url: cls.url,
  }))
}

interface RawClassSpellsResult {
  index: string
  name: string
  level: number
  url: string
}

interface RawClassSpellsResponse {
  count: number
  results: RawClassSpellsResult[]
}

export async function fetchClassSpellIndices(classIndex: string): Promise<Set<string>> {
  const res = await fetch(`${BASE_URL}/classes/${classIndex}/spells`)

  if (!res.ok) {
    throw new Error(
      `Impossible de charger les sorts de cette classe. (Unable to load spells for this class.)`,
    )
  }

  const data = (await res.json()) as RawClassSpellsResponse
  return new Set(data.results.map((spell) => spell.index))
}

interface RawClassDetail {
  index: string
  spellcasting?: unknown
}

/**
 * Garde les classes qui lancent des sorts. L'API n'expose le bloc `spellcasting`
 * que sur ces classes : barbare, guerrier, moine et roublard en sont depourvus.
 */
export async function fetchSpellcastingClassIndices(
  classIndices: string[],
): Promise<Set<string>> {
  const details = await Promise.all(
    classIndices.map(async (classIndex) => {
      const res = await fetch(`${BASE_URL}/classes/${classIndex}${EN}`)
      if (!res.ok) {
        throw new Error(
          'Impossible de determiner les classes de lanceurs de sorts. (Unable to load spellcasting classes.)',
        )
      }
      return (await res.json()) as RawClassDetail
    }),
  )

  return new Set(details.filter((cls) => cls.spellcasting).map((cls) => cls.index))
}

export interface ClassLevelSpellcasting {
  cantripsKnown: number
  /** Plus haut niveau de sort accessible, 0 si aucun emplacement. */
  maxSpellLevel: number
}

interface RawClassLevel {
  spellcasting?: Record<string, number>
  class_specific?: Record<string, number>
}

/** Plus haut N tel que `${prefix}N` est non nul. */
function highestNonZeroLevel(fields: Record<string, number> | undefined, prefix: string): number {
  if (!fields) return 0
  let highest = 0
  for (const [key, value] of Object.entries(fields)) {
    if (!key.startsWith(prefix) || !value) continue
    const level = Number(key.slice(prefix.length))
    if (level > highest) highest = level
  }
  return highest
}

/** Cle `classIndex/niveau`, pour passer par `useKeyedFetch`. */
export async function fetchClassLevelSpellcasting(key: string): Promise<ClassLevelSpellcasting> {
  const [classIndex, characterLevel] = key.split('/')
  const res = await fetch(`${BASE_URL}/classes/${classIndex}/levels/${characterLevel}${EN}`)

  if (!res.ok) {
    throw new Error(
      'Impossible de charger les emplacements de sorts de ce niveau. (Unable to load spell slots for this level.)',
    )
  }

  const data = (await res.json()) as RawClassLevel

  // L'occultiste accede aux sorts de niveau 6 a 9 par l'arcane mystique,
  // expose hors du bloc `spellcasting`.
  const maxSpellLevel = Math.max(
    highestNonZeroLevel(data.spellcasting, 'spell_slots_level_'),
    highestNonZeroLevel(data.class_specific, 'mystic_arcanum_level_'),
  )

  return { cantripsKnown: data.spellcasting?.cantrips_known ?? 0, maxSpellLevel }
}
