import { useCallback } from 'react'
import { fetchClassLevelSpellcasting, fetchClassSpellIndices } from '../api/classes'
import { fetchSubclassSpells } from '../api/subclasses'
import { isSpellAccessibleForProfile } from '../utils/spellAccess'
import type { SpellcasterProfile } from './usePersonalSpellbook'
import { useMultiKeyedFetch } from './useMultiKeyedFetch'
import type { SpellAccessCheck } from './useSpellAccess'

interface UseMultiSpellAccessResult {
  /** `null` sans aucun profil ou tant que les donnees manquent : rien n'est grise. */
  isAccessible: SpellAccessCheck | null
  loading: boolean
  error: string | null
}

/**
 * Union de plusieurs profils (multiclasse) : un sort est accessible s'il
 * l'est pour au moins un des blocs classe/niveau/sous-classe, sans agreger
 * les niveaux entre classes (chaque bloc reste autonome).
 */
export function useMultiSpellAccess(profiles: SpellcasterProfile[]): UseMultiSpellAccessResult {
  const classIndices = profiles.map((profile) => profile.classIndex)
  const slotKeys = profiles
    .filter((profile) => profile.characterLevel !== null)
    .map((profile) => `${profile.classIndex}/${profile.characterLevel}`)
  const subclassIndices = profiles
    .map((profile) => profile.subclassIndex)
    .filter((subclassIndex): subclassIndex is string => subclassIndex !== null)

  const {
    data: classSpellIndicesByClass,
    loading: classesLoading,
    error: classesError,
  } = useMultiKeyedFetch(classIndices, fetchClassSpellIndices)
  const {
    data: slotsByKey,
    loading: slotsLoading,
    error: slotsError,
  } = useMultiKeyedFetch(slotKeys, fetchClassLevelSpellcasting)
  const {
    data: subclassGrantsByIndex,
    loading: subclassLoading,
    error: subclassError,
  } = useMultiKeyedFetch(subclassIndices, fetchSubclassSpells)

  const ready = profiles.every((profile) => {
    const classReady = profile.classIndex in classSpellIndicesByClass
    const slotsReady =
      profile.characterLevel === null ||
      `${profile.classIndex}/${profile.characterLevel}` in slotsByKey
    const subclassReady = !profile.subclassIndex || profile.subclassIndex in subclassGrantsByIndex
    return classReady && slotsReady && subclassReady
  })

  const check = useCallback<SpellAccessCheck>(
    (index, level) =>
      profiles.some((profile) =>
        isSpellAccessibleForProfile(
          profile,
          {
            classSpellIndices: classSpellIndicesByClass[profile.classIndex] ?? null,
            slots:
              profile.characterLevel !== null
                ? (slotsByKey[`${profile.classIndex}/${profile.characterLevel}`] ?? null)
                : null,
            subclassGrants: profile.subclassIndex
              ? (subclassGrantsByIndex[profile.subclassIndex] ?? null)
              : null,
          },
          index,
          level,
        ),
      ),
    [profiles, classSpellIndicesByClass, slotsByKey, subclassGrantsByIndex],
  )

  return {
    isAccessible: profiles.length > 0 && ready ? check : null,
    loading: classesLoading || slotsLoading || subclassLoading,
    error: classesError ?? slotsError ?? subclassError,
  }
}
