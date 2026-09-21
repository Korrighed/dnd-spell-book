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

/** Marge toleree quand le mot tape depasse le mot du nom : "eclairs" pour "eclair". */
const INFLECTION_SLACK = 2

function wordMatches(textWord: string, queryWord: string): boolean {
  // Cas normal : on tape un debut de mot.
  if (textWord.startsWith(queryWord)) return true

  // Cas inverse : on tape une flexion un peu plus longue (pluriel, feminin).
  // Marge volontairement courte, sinon "fireball" remonterait tous les sorts en "fire".
  return (
    queryWord.startsWith(textWord) && queryWord.length - textWord.length <= INFLECTION_SLACK
  )
}

/**
 * Correspondance souple entre une recherche et un nom de sort.
 *
 * La correspondance stricte par sous-chaine echoue des que l'utilisateur tape un mot
 * plus long que celui du nom : "Eclaire" ne trouve pas "Eclair". Chaque mot tape doit
 * donc correspondre a un mot du nom. Les accents sont deja neutralises en amont.
 */
export function matchesSearch(text: string, query: string): boolean {
  const queryWords = words(query)
  if (queryWords.length === 0) return true

  // Chemin direct : la recherche complete apparait telle quelle dans le nom.
  if (normalizeForSearch(text).includes(normalizeForSearch(query.trim()))) return true

  const textWords = words(text)
  return queryWords.every((queryWord) =>
    textWords.some((textWord) => wordMatches(textWord, queryWord)),
  )
}
