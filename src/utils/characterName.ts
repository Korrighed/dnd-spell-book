import { normalizeForSearch } from './text'

export const MAX_CHARACTER_NAME_LENGTH = 40

/** Nom nettoye : caracteres invisibles et espaces de bord retires. */
export function cleanCharacterName(name: string): string {
  return name.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
}

/** Nom deja porte par un autre personnage (sans casse ni accents). `exceptId` : celui qu'on renomme. */
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
