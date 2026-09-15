const BASE_URL = 'https://www.dnd5eapi.co/api/2014'

/**
 * L'API repond dans la langue de l'en-tete `Accept-Language` quand aucun `lang`
 * n'est passe. Depuis un navigateur configure en francais, l'endpoint nu renvoie
 * donc du francais et la colonne anglaise se retrouve dupliquee. La langue doit
 * toujours etre explicite, anglais compris.
 */
const EN = '?lang=en'
const FR = '?lang=fr-FR'

export interface SpellListItem {
  index: string
  name: string
  nameFr: string
  level: number
  url: string
}

interface RawSpellListResult {
  index: string
  name: string
  level: number
  url: string
}

interface RawSpellListResponse {
  count: number
  results: RawSpellListResult[]
}

export async function fetchSpellList(): Promise<SpellListItem[]> {
  const [enRes, frRes] = await Promise.all([
    fetch(`${BASE_URL}/spells${EN}`),
    fetch(`${BASE_URL}/spells${FR}`),
  ])

  if (!enRes.ok || !frRes.ok) {
    throw new Error(
      'Impossible de charger la liste des sorts depuis l\'API. (Unable to load the spell list from the API.)',
    )
  }

  const [en, fr] = (await Promise.all([enRes.json(), frRes.json()])) as [
    RawSpellListResponse,
    RawSpellListResponse,
  ]

  const frNameByIndex = new Map(fr.results.map((spell) => [spell.index, spell.name]))

  return en.results.map((spell) => ({
    index: spell.index,
    name: spell.name,
    nameFr: frNameByIndex.get(spell.index) ?? spell.name,
    level: spell.level,
    url: spell.url,
  }))
}
