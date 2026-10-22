export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function words(text: string): string[] {
  return normalizeForSearch(text)
    .split(/[^\p{Letter}\p{Number}]+/u)
    .filter(Boolean)
}

/** Lettres en trop tolerees (pluriel, feminin) : "eclairs" trouve "eclair". */
const INFLECTION_SLACK = 2

function wordMatches(textWord: string, queryWord: string): boolean {
  if (textWord.startsWith(queryWord)) return true

  return (
    queryWord.startsWith(textWord) && queryWord.length - textWord.length <= INFLECTION_SLACK
  )
}

/** Recherche souple : chaque mot tape doit correspondre a un mot du nom, accents ignores. */
export function matchesSearch(text: string, query: string): boolean {
  const queryWords = words(query)
  if (queryWords.length === 0) return true

  if (normalizeForSearch(text).includes(normalizeForSearch(query.trim()))) return true

  const textWords = words(text)
  return queryWords.every((queryWord) =>
    textWords.some((textWord) => wordMatches(textWord, queryWord)),
  )
}
