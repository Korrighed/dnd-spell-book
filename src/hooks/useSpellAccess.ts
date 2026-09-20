import { useCallback } from 'react'
import { fetchClassLevelSpellcasting } from '../api/classes'
import { fetchSubclassSpells, type SubclassSpellGrant } from '../api/subclasses'
import type { SpellcasterProfile } from './usePersonalSpellbook'
import { useClassSpellIndices } from './useClassSpellIndices'
import { useKeyedFetch } from './useKeyedFetch'

export type SpellAccessCheck = (index: string, level: number) => boolean

interface UseSpellAccessResult {
  /** `null` sans profil ou tant que les donnees manquent : rien n'est grise. */
  isAccessible: SpellAccessCheck | null
  /** `null` sans niveau precise ou pendant le chargement. */
  maxSpellLevel: number | null
  loading: boolean
  error: string | null
  /** Sorts accordes par la sous-classe du profil, `null` sans sous-classe choisie. */
  subclassSpellGrants: SubclassSpellGrant[] | null
}

export function useSpellAccess(profile: SpellcasterProfile | null): UseSpellAccessResult {
  const {
    indices: classSpellIndices,
    loading: spellsLoading,
    error: spellsError,
  } = useClassSpellIndices(profile?.classIndex ?? null)
  const {
    data: slots,
    loading: slotsLoading,
    error: slotsError,
  } = useKeyedFetch(
    // Sans niveau precise, pas d'appel : toute la liste de la classe est accessible.
    profile && profile.characterLevel !== null
      ? `${profile.classIndex}/${profile.characterLevel}`
      : null,
    fetchClassLevelSpellcasting,
  )
  const {
    data: subclassGrants,
    loading: subclassLoading,
    error: subclassError,
  } = useKeyedFetch(profile?.subclassIndex ?? null, fetchSubclassSpells)

  const levelKnown = profile?.characterLevel == null || slots !== null
  const subclassKnown = !profile?.subclassIndex || subclassGrants !== null
  const ready = classSpellIndices !== null && levelKnown && subclassKnown

  const check = useCallback<SpellAccessCheck>(
    (index, level) => {
      if (!classSpellIndices) return true
      const inClassList = classSpellIndices.has(index)
      // Sans niveau precise, le profil est au niveau max : rien n'est ecarte par minLevel.
      const effectiveLevel = profile?.characterLevel ?? Infinity
      const grantedBySubclass = (subclassGrants ?? []).some(
        (grant) =>
          grant.spellIndex === index &&
          grant.minLevel <= effectiveLevel &&
          // Sous-choix non precise (ex. terrain non choisi) : on n'ecarte rien,
          // meme regle de permissivite que le niveau facultatif.
          (!grant.feature ||
            !profile?.subclassFeatureIndex ||
            grant.feature.index === profile.subclassFeatureIndex),
      )
      if (!inClassList && !grantedBySubclass) return false
      // Sort connu uniquement via la sous-classe : accorde d'office, pas de
      // limite par emplacement de sort de la classe.
      if (grantedBySubclass && !inClassList) return true
      if (!slots) return true
      if (level === 0) return slots.cantripsKnown > 0
      return level <= slots.maxSpellLevel
    },
    [classSpellIndices, slots, subclassGrants, profile],
  )

  return {
    isAccessible: ready ? check : null,
    maxSpellLevel: slots?.maxSpellLevel ?? null,
    loading: spellsLoading || slotsLoading || subclassLoading,
    error: spellsError ?? slotsError ?? subclassError,
    subclassSpellGrants: subclassGrants,
  }
}
