const BASE_URL = 'https://www.dnd5eapi.co/api/2014'

export interface SchoolListItem {
  index: string
  name: string
  nameFr: string
  url: string
}

interface RawSchoolListResult {
  index: string
  name: string
  url: string
}

interface RawSchoolListResponse {
  count: number
  results: RawSchoolListResult[]
}

export async function fetchSchoolList(): Promise<SchoolListItem[]> {
  const [enRes, frRes] = await Promise.all([
    fetch(`${BASE_URL}/magic-schools`),
    fetch(`${BASE_URL}/magic-schools?lang=fr-FR`),
  ])

  if (!enRes.ok || !frRes.ok) {
    throw new Error(
      'Impossible de charger la liste des ecoles depuis l\'API. (Unable to load the school list from the API.)',
    )
  }

  const [en, fr] = (await Promise.all([enRes.json(), frRes.json()])) as [
    RawSchoolListResponse,
    RawSchoolListResponse,
  ]

  const frNameByIndex = new Map(fr.results.map((school) => [school.index, school.name]))

  return en.results.map((school) => ({
    index: school.index,
    name: school.name,
    nameFr: frNameByIndex.get(school.index) ?? school.name,
    url: school.url,
  }))
}

interface RawSpellsBySchoolResult {
  index: string
  name: string
  level: number
  url: string
}

interface RawSpellsBySchoolResponse {
  count: number
  results: RawSpellsBySchoolResult[]
}

export async function fetchSchoolSpellIndices(schoolIndex: string): Promise<Set<string>> {
  const res = await fetch(`${BASE_URL}/spells?school=${schoolIndex}`)

  if (!res.ok) {
    throw new Error(
      'Impossible de charger les sorts de cette ecole. (Unable to load spells for this school.)',
    )
  }

  const data = (await res.json()) as RawSpellsBySchoolResponse
  return new Set(data.results.map((spell) => spell.index))
}
