const BASE_URL = 'https://www.dnd5eapi.co/api/2014'

/** Langue explicite obligatoire : sans `lang`, l'API suit l'en-tete `Accept-Language`. */
const EN = '?lang=en'
const FR = '?lang=fr-FR'

export interface SubclassListItem {
  index: string
  name: string
  nameFr: string
}

interface RawSubclassListResult {
  index: string
  name: string
}

interface RawSubclassListResponse {
  count: number
  results: RawSubclassListResult[]
}

/**
 * Sous-classes d'une classe. Le SRD 5.1 n'en expose qu'une par classe pour
 * l'instant (contrainte de licence), mais l'endpoint est prevu pour en
 * accepter plusieurs : rien ici ne suppose qu'il y en a une seule.
 */
export async function fetchClassSubclasses(classIndex: string): Promise<SubclassListItem[]> {
  const [enRes, frRes] = await Promise.all([
    fetch(`${BASE_URL}/classes/${classIndex}/subclasses${EN}`),
    fetch(`${BASE_URL}/classes/${classIndex}/subclasses${FR}`),
  ])

  if (!enRes.ok || !frRes.ok) {
    throw new Error(
      'Impossible de charger les sous-classes de cette classe. (Unable to load subclasses for this class.)',
    )
  }

  const [en, fr] = (await Promise.all([enRes.json(), frRes.json()])) as [
    RawSubclassListResponse,
    RawSubclassListResponse,
  ]

  const frNameByIndex = new Map(fr.results.map((sub) => [sub.index, sub.name]))

  return en.results.map((sub) => ({
    index: sub.index,
    name: sub.name,
    nameFr: frNameByIndex.get(sub.index) ?? sub.name,
  }))
}

/**
 * Sous-choix a l'interieur d'une sous-classe, expose par l'API comme un
 * prerequis de type `feature`. Seul cas connu dans le SRD : le terrain du
 * Cercle de la Terre du Druide (Arctique, Cotier, Desert...).
 */
export interface SubclassFeatureOption {
  index: string
  name: string
  nameFr: string
}

export interface SubclassSpellGrant {
  spellIndex: string
  /** Niveau de personnage minimum pour obtenir ce sort. */
  minLevel: number
  /** `null` pour les sous-classes sans sous-choix (Vie, Fielon, Devotion). */
  feature: SubclassFeatureOption | null
}

interface RawPrerequisite {
  index: string
  type: 'level' | 'feature'
  name: string
}

interface RawSubclassSpellEntry {
  prerequisites: RawPrerequisite[]
  spell: { index: string }
}

interface RawSubclassDetail {
  spells: RawSubclassSpellEntry[]
}

async function fetchRawSubclassDetail(
  subclassIndex: string,
  lang: 'en' | 'fr-FR',
): Promise<RawSubclassDetail> {
  const res = await fetch(`${BASE_URL}/subclasses/${subclassIndex}?lang=${lang}`)

  if (!res.ok) {
    throw new Error(
      'Impossible de charger les sorts de cette sous-classe. (Unable to load spells for this subclass.)',
    )
  }

  return (await res.json()) as RawSubclassDetail
}

/** Niveau minimum, tire du prerequis `type: "level"` (ex. index `cleric-5` -> 5). */
function parseMinLevel(prerequisites: RawPrerequisite[]): number {
  const levelPrereq = prerequisites.find((prereq) => prereq.type === 'level')
  if (!levelPrereq) return 1
  const level = Number(levelPrereq.index.split('-').pop())
  return Number.isFinite(level) ? level : 1
}

/**
 * Sorts accordes par une sous-classe, en plus de la liste de base de la classe.
 * Vide pour la plupart des sous-classes du SRD : seules Vie, Fielon, Devotion
 * et Terre en accordent (verifie le 2026-09-21).
 */
export async function fetchSubclassSpells(subclassIndex: string): Promise<SubclassSpellGrant[]> {
  const [en, fr] = await Promise.all([
    fetchRawSubclassDetail(subclassIndex, 'en'),
    fetchRawSubclassDetail(subclassIndex, 'fr-FR'),
  ])

  const frFeatureNameByIndex = new Map<string, string>()
  for (const entry of fr.spells) {
    const feature = entry.prerequisites.find((prereq) => prereq.type === 'feature')
    if (feature) frFeatureNameByIndex.set(feature.index, feature.name)
  }

  return en.spells.map((entry) => {
    const featurePrereq = entry.prerequisites.find((prereq) => prereq.type === 'feature')

    return {
      spellIndex: entry.spell.index,
      minLevel: parseMinLevel(entry.prerequisites),
      feature: featurePrereq
        ? {
            index: featurePrereq.index,
            name: featurePrereq.name,
            nameFr: frFeatureNameByIndex.get(featurePrereq.index) ?? featurePrereq.name,
          }
        : null,
    }
  })
}
