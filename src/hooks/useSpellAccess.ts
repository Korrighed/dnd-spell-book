import { useCallback } from 'react'
import { fetchClassLevelSpellcasting } from '../api/classes'
import { fetchSubclassSpells, type SubclassSpellGrant } from '../api/subclasses'
import { isSpellAccessibleForProfile } from '../utils/spellAccess'
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
      if (!profile) return true
      return isSpellAccessibleForProfile(
        profile,
        { classSpellIndices, slots, subclassGrants },
        index,
        level,
      )
    },
    [profile, classSpellIndices, slots, subclassGrants],
  )

  return {
    isAccessible: ready ? check : null,
    maxSpellLevel: slots?.maxSpellLevel ?? null,
    loading: spellsLoading || slotsLoading || subclassLoading,
    error: spellsError ?? slotsError ?? subclassError,
    subclassSpellGrants: subclassGrants,
  }
}
