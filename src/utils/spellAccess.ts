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

/**
 * Regle d'accessibilite d'un sort pour UN profil (une classe). Utilisee par
 * useMultiSpellAccess (union sur plusieurs blocs, multiclasse) pour ne jamais
 * dupliquer la regle.
 */
export function isSpellAccessibleForProfile(
  profile: SpellcasterProfile,
  data: SpellAccessData,
  spellIndex: string,
  spellLevel: number,
): boolean {
  // Donnees pas encore chargees : l'appelant decide de la permissivite via `ready`.
  if (!data.classSpellIndices) return true

  const inClassList = data.classSpellIndices.has(spellIndex)
  // Sans niveau precise, le profil est au niveau max : rien n'est ecarte par minLevel.
  const effectiveLevel = profile.characterLevel ?? Infinity
  const subclassUnlocked = effectiveLevel >= getSubclassUnlockLevel(profile.classIndex)
  const grantedBySubclass = (data.subclassGrants ?? []).some(
    (grant) =>
      subclassUnlocked &&
      grant.spellIndex === spellIndex &&
      grant.minLevel <= effectiveLevel &&
      // Sous-choix non precise (ex. terrain non choisi) : on n'ecarte rien,
      // meme regle de permissivite que le niveau facultatif.
      (!grant.feature ||
        !profile.subclassFeatureIndex ||
        grant.feature.index === profile.subclassFeatureIndex),
  )

  if (!inClassList && !grantedBySubclass) return false
  // Sort connu uniquement via la sous-classe : accorde d'office, pas de limite
  // par emplacement de sort de la classe.
  if (grantedBySubclass && !inClassList) return true
  if (!data.slots) return true
  if (spellLevel === 0) return data.slots.cantripsKnown > 0
  return spellLevel <= data.slots.maxSpellLevel
}
