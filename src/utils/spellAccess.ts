import type { ClassLevelSpellcasting } from '../api/classes'
import type { SubclassSpellGrant } from '../api/subclasses'
import { getSubclassUnlockLevel } from '../data/subclassUnlockLevel'
import type { SpellcasterProfile } from '../hooks/usePersonalSpellbook'

export interface SpellAccessData {
  classSpellIndices: Set<string> | null
  slots: ClassLevelSpellcasting | null
  subclassGrants: SubclassSpellGrant[] | null
}

export type SpellAccessCheck = (index: string, level: number) => boolean

/** Accessibilite d'un sort pour un profil (une classe). */
export function isSpellAccessibleForProfile(
  profile: SpellcasterProfile,
  data: SpellAccessData,
  spellIndex: string,
  spellLevel: number,
): boolean {
  if (!data.classSpellIndices) return true

  const inClassList = data.classSpellIndices.has(spellIndex)
  // Sans niveau precise : niveau max.
  const effectiveLevel = profile.characterLevel ?? Infinity
  const subclassUnlocked = effectiveLevel >= getSubclassUnlockLevel(profile.classIndex)
  const grantedBySubclass = (data.subclassGrants ?? []).some(
    (grant) =>
      subclassUnlocked &&
      grant.spellIndex === spellIndex &&
      grant.minLevel <= effectiveLevel &&
      // Sous-choix non precise : rien n'est ecarte.
      (!grant.feature ||
        !profile.subclassFeatureIndex ||
        grant.feature.index === profile.subclassFeatureIndex),
  )

  if (!inClassList && !grantedBySubclass) return false
  // Sort de sous-classe : accorde d'office, sans limite d'emplacement.
  if (grantedBySubclass && !inClassList) return true
  if (!data.slots) return true
  if (spellLevel === 0) return data.slots.cantripsKnown > 0
  return spellLevel <= data.slots.maxSpellLevel
}
