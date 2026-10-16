import { normalizeForSearch } from './text'

/** Longueur maximale d'un nom de personnage (pastilles, liste, confirmation). */
export const MAX_CHARACTER_NAME_LENGTH = 40

/**
 * Nom tel qu'enregistre : caracteres invisibles (espaces de largeur nulle,
 * BOM) retires, puis espaces de debut et de fin. Sinon un nom fait de ces
 * seuls caracteres passerait pour non vide et donnerait une pastille vide.
 */
export function cleanCharacterName(name: string): string {
  return name.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
}

/**
 * Vrai si un AUTRE personnage porte deja ce nom, sans tenir compte des
 * majuscules ni des accents (« Elodie » = « élodie »). `exceptId` : le
 * personnage en cours de renommage, qui peut garder son propre nom.
 */
export function isCharacterNameTaken(
  characters: { id: string; name: string }[],
  name: string,
  exceptId: string | null = null,
): boolean {
  const key = normalizeForSearch(cleanCharacterName(name))
  return characters.some(
    (character) =>
      character.id !== exceptId && normalizeForSearch(cleanCharacterName(character.name)) === key,
  )
}
