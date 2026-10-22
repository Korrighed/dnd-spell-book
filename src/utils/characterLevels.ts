import { MAX_CHARACTER_LEVEL, type SpellcasterProfile } from '../hooks/usePersonalSpellbook'

/** Niveau total maximal, toutes classes confondues (regle D&D). */
export const MAX_TOTAL_CHARACTER_LEVEL = 20

/** Somme des niveaux precises. Un niveau `null` (« non precise ») ne compte pas. */
export function totalSpecifiedLevel(profiles: SpellcasterProfile[]): number {
  return profiles.reduce((sum, profile) => sum + (profile.characterLevel ?? 0), 0)
}

/**
 * Plus haut niveau proposable pour `profileId` : plafond total moins les
 * niveaux des autres profils. `null` : profil pas encore cree. 0 : seule
 * l'option « non precise » reste possible.
 */
export function maxLevelForProfile(
  profiles: SpellcasterProfile[],
  profileId: string | null,
): number {
  const others = profiles.filter((profile) => profile.id !== profileId)
  const remaining = MAX_TOTAL_CHARACTER_LEVEL - totalSpecifiedLevel(others)
  return Math.max(0, Math.min(MAX_CHARACTER_LEVEL, remaining))
}
