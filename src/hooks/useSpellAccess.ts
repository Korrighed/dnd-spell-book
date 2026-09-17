import { useCallback } from 'react'
import { fetchClassLevelSpellcasting } from '../api/classes'
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

  const levelKnown = profile?.characterLevel == null || slots !== null
  const ready = classSpellIndices !== null && levelKnown

  const check = useCallback<SpellAccessCheck>(
    (index, level) => {
      if (!classSpellIndices) return true
      if (!classSpellIndices.has(index)) return false
      if (!slots) return true
      if (level === 0) return slots.cantripsKnown > 0
      return level <= slots.maxSpellLevel
    },
    [classSpellIndices, slots],
  )

  return {
    isAccessible: ready ? check : null,
    maxSpellLevel: slots?.maxSpellLevel ?? null,
    loading: spellsLoading || slotsLoading,
    error: spellsError ?? slotsError,
  }
}
