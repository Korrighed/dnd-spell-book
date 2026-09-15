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
