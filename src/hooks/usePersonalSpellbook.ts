import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface PersonalSpell {
  index: string
  addedAt: string
}

/** Personnage de reference : sert a deduire les sorts accessibles. */
export interface SpellcasterProfile {
  classIndex: string
  /** `null` : niveau non precise, equivalent au niveau max (tous les sorts de la classe). */
  characterLevel: number | null
  /** `null` : sous-classe non precisee, ou pas encore debloquee au niveau actuel. */
  subclassIndex: string | null
  /**
   * Sous-choix a l'interieur de la sous-classe (ex. terrain du Cercle de la
   * Terre). `null` : sans effet pour les sous-classes qui n'en ont pas, ou
   * pas encore choisi.
   */
  subclassFeatureIndex: string | null
}

interface SpellbookState {
  spells: PersonalSpell[]
  /** Un bloc par classe du personnage (multiclasse) : voir SPECS/TRAVAIL-EN-COURS. */
  profiles: SpellcasterProfile[]
}

interface StoredSpellbook extends SpellbookState {
  version: number
}

const STORAGE_KEY = 'dnd-personal-spellbook'
const STORAGE_VERSION = 3

export const MIN_CHARACTER_LEVEL = 1
export const MAX_CHARACTER_LEVEL = 20

const EMPTY_SPELLBOOK: SpellbookState = { spells: [], profiles: [] }

function isPersonalSpell(value: unknown): value is PersonalSpell {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.index === 'string' && typeof candidate.addedAt === 'string'
}

/** Forme tolerante : `subclassIndex`/`subclassFeatureIndex` absents sur les profils v2 anterieurs. */
interface StoredProfileShape {
  classIndex: string
  characterLevel: number | null
  subclassIndex?: string | null
  subclassFeatureIndex?: string | null
}

function isStoredProfile(value: unknown): value is StoredProfileShape {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  if (typeof candidate.classIndex !== 'string') return false
  if (candidate.characterLevel !== null) {
    if (
      !Number.isInteger(candidate.characterLevel) ||
      (candidate.characterLevel as number) < MIN_CHARACTER_LEVEL ||
      (candidate.characterLevel as number) > MAX_CHARACTER_LEVEL
    ) {
      return false
    }
  }
  if (candidate.subclassIndex != null && typeof candidate.subclassIndex !== 'string') return false
  if (candidate.subclassFeatureIndex != null && typeof candidate.subclassFeatureIndex !== 'string') {
    return false
  }
  return true
}

function normalizeProfile(stored: StoredProfileShape): SpellcasterProfile {
  return {
    classIndex: stored.classIndex,
    characterLevel: stored.characterLevel,
    subclassIndex: stored.subclassIndex ?? null,
    subclassFeatureIndex: stored.subclassFeatureIndex ?? null,
  }
}

/** v1/v2 portaient un seul profil ; v3 porte une liste (multiclasse). */
interface LegacyEnvelope {
  spells?: unknown
  profile?: unknown
  profiles?: unknown
}

function readSpellbook(): SpellbookState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return EMPTY_SPELLBOOK

    const parsed: unknown = JSON.parse(stored)

    // Format v0 : tableau brut, ecrit par les premieres versions du hook.
    if (Array.isArray(parsed)) return { spells: parsed.filter(isPersonalSpell), profiles: [] }

    if (typeof parsed === 'object' && parsed !== null) {
      const envelope = parsed as LegacyEnvelope
      const spells = Array.isArray(envelope.spells) ? envelope.spells.filter(isPersonalSpell) : []

      // v3 : liste de profils.
      if (Array.isArray(envelope.profiles)) {
        return {
          spells,
          profiles: envelope.profiles.filter(isStoredProfile).map(normalizeProfile),
        }
      }

      // v1 (pas de profil) / v2 (un seul profil) : un profil absent ou invalide vaut [].
      return {
        spells,
        profiles: isStoredProfile(envelope.profile) ? [normalizeProfile(envelope.profile)] : [],
      }
    }

    return EMPTY_SPELLBOOK
  } catch {
    return EMPTY_SPELLBOOK
  }
}

function writeSpellbook(state: SpellbookState) {
  try {
    const envelope: StoredSpellbook = { version: STORAGE_VERSION, ...state }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    console.error('Impossible de sauvegarder le grimoire personnel.')
  }
}

export function usePersonalSpellbook() {
  const [state, setState] = useState<SpellbookState>(readSpellbook)
  const hydrated = useRef(false)
  const { spells, profiles } = state

  const indices = useMemo(() => new Set(spells.map((spell) => spell.index)), [spells])

  useEffect(() => {
    // Pas d'ecriture au montage : on ne reecrit le stockage que sur un vrai changement.
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    writeSpellbook(state)
  }, [state])

  useEffect(() => {
    // L'evenement `storage` n'est emis que dans les AUTRES onglets, jamais dans celui
    // qui ecrit. Relire le stockage ici ne peut donc pas boucler avec l'effet d'ecriture.
    function handleStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== STORAGE_KEY) return
      setState(readSpellbook())
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const add = useCallback((index: string) => {
    setState((prev) => {
      if (prev.spells.some((spell) => spell.index === index)) return prev
      return { ...prev, spells: [...prev.spells, { index, addedAt: new Date().toISOString() }] }
    })
  }, [])

  const remove = useCallback((index: string) => {
    setState((prev) => ({ ...prev, spells: prev.spells.filter((spell) => spell.index !== index) }))
  }, [])

  const toggle = useCallback((index: string) => {
    setState((prev) => {
      if (prev.spells.some((spell) => spell.index === index)) {
        return { ...prev, spells: prev.spells.filter((spell) => spell.index !== index) }
      }
      return { ...prev, spells: [...prev.spells, { index, addedAt: new Date().toISOString() }] }
    })
  }, [])

  const setProfileAt = useCallback((profileIndex: number, next: SpellcasterProfile) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((profile, i) => (i === profileIndex ? next : profile)),
    }))
  }, [])

  const addProfile = useCallback((profile: SpellcasterProfile) => {
    setState((prev) => ({ ...prev, profiles: [...prev.profiles, profile] }))
  }, [])

  const removeProfileAt = useCallback((profileIndex: number) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((_, i) => i !== profileIndex),
    }))
  }, [])

  const has = useCallback((index: string) => indices.has(index), [indices])

  return {
    spells,
    indices,
    profiles,
    add,
    remove,
    toggle,
    has,
    setProfileAt,
    addProfile,
    removeProfileAt,
  }
}
