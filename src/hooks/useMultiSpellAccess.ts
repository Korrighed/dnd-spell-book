import { useCallback } from 'react'
import { fetchClassLevelSpellcasting, fetchClassSpellIndices } from '../api/classes'
import { fetchSubclassSpells, type SubclassSpellGrant } from '../api/subclasses'
import { isSpellAccessibleForProfile, type SpellAccessCheck } from '../utils/spellAccess'
import type { SpellcasterProfile } from './usePersonalSpellbook'
import { useMultiKeyedFetch } from './useMultiKeyedFetch'

/** Donnees d'un seul bloc, derivees du meme fetch partage : aucun appel reseau supplementaire. */
export interface ProfileSpellcastingInfo {
  /** `null` sans niveau precise ou pendant le chargement. */
  maxSpellLevel: number | null
  /** Sorts accordes par la sous-classe du profil, `null` sans sous-classe choisie. */
  subclassSpellGrants: SubclassSpellGrant[] | null
  loading: boolean
  error: string | null
}

interface UseMultiSpellAccessResult {
  /** `null` sans aucun profil ou tant que les donnees manquent : rien n'est grise. */
  isAccessible: SpellAccessCheck | null
  loading: boolean
  error: string | null
  /** Une entree par profil, meme ordre que l'entree : pour l'affichage propre a chaque bloc. */
  perProfile: ProfileSpellcastingInfo[]
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

  const perProfile = profiles.map((profile) => {
    const slotKey = profile.characterLevel !== null ? `${profile.classIndex}/${profile.characterLevel}` : null
    const classReady = profile.classIndex in classSpellIndicesByClass
    const slotsReady = slotKey === null || slotKey in slotsByKey
    const subclassReady = !profile.subclassIndex || profile.subclassIndex in subclassGrantsByIndex
    const slots = slotKey ? (slotsByKey[slotKey] ?? null) : null

    return {
      maxSpellLevel: slots?.maxSpellLevel ?? null,
      subclassSpellGrants: profile.subclassIndex
        ? (subclassGrantsByIndex[profile.subclassIndex] ?? null)
        : null,
      loading: !(classReady && slotsReady && subclassReady),
      error: classesError ?? slotsError ?? subclassError,
    }
  })

  return {
    isAccessible: profiles.length > 0 && ready ? check : null,
    loading: classesLoading || slotsLoading || subclassLoading,
    error: classesError ?? slotsError ?? subclassError,
    perProfile,
  }
}
