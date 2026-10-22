import { MAX_CHARACTER_LEVEL, type SpellcasterProfile } from '../hooks/usePersonalSpellbook'

/** Niveau total maximal d'un personnage, toutes classes confondues (regle D&D). */
export const MAX_TOTAL_CHARACTER_LEVEL = 20

/**
 * Somme des niveaux PRECISES des profils. Un niveau `null` (« non precise »)
 * ne compte pas : il signifie « tous les sorts de la classe », pas un niveau
 * reel (regle du multiclasse, docs/APP-FLOW.md).
 */
export function totalSpecifiedLevel(profiles: SpellcasterProfile[]): number {
  return profiles.reduce((sum, profile) => sum + (profile.characterLevel ?? 0), 0)
}

/**
 * Plus haut niveau proposable pour le profil `profileId` : le plafond total
 * moins les niveaux precises des AUTRES profils, borne entre 0 et
 * MAX_CHARACTER_LEVEL. `profileId` null : profil pas encore cree (carte
 * « Ajouter une classe »), tous les profils comptent comme « autres ».
 * 0 : seule l'option « non precise » reste possible.
 */
export function maxLevelForProfile(
  profiles: SpellcasterProfile[],
  profileId: string | null,
): number {
  const others = profiles.filter((profile) => profile.id !== profileId)
  const remaining = MAX_TOTAL_CHARACTER_LEVEL - totalSpecifiedLevel(others)
  return Math.max(0, Math.min(MAX_CHARACTER_LEVEL, remaining))
}
