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
}

interface SpellbookState {
  spells: PersonalSpell[]
  profile: SpellcasterProfile | null
}

interface StoredSpellbook extends SpellbookState {
  version: number
}

const STORAGE_KEY = 'dnd-personal-spellbook'
const STORAGE_VERSION = 2

export const MIN_CHARACTER_LEVEL = 1
export const MAX_CHARACTER_LEVEL = 20

const EMPTY_SPELLBOOK: SpellbookState = { spells: [], profile: null }

function isPersonalSpell(value: unknown): value is PersonalSpell {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.index === 'string' && typeof candidate.addedAt === 'string'
}

function isSpellcasterProfile(value: unknown): value is SpellcasterProfile {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  if (typeof candidate.classIndex !== 'string') return false
  if (candidate.characterLevel === null) return true
  return (
    Number.isInteger(candidate.characterLevel) &&
    (candidate.characterLevel as number) >= MIN_CHARACTER_LEVEL &&
    (candidate.characterLevel as number) <= MAX_CHARACTER_LEVEL
  )
}

function readSpellbook(): SpellbookState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return EMPTY_SPELLBOOK

    const parsed: unknown = JSON.parse(stored)

    // Format v0 : tableau brut, ecrit par les premieres versions du hook.
    if (Array.isArray(parsed)) return { spells: parsed.filter(isPersonalSpell), profile: null }

    // v1 : enveloppe sans profil. v2 : enveloppe avec profil. La lecture est commune,
    // un profil absent ou invalide vaut simplement `null`.
    if (typeof parsed === 'object' && parsed !== null) {
      const envelope = parsed as Partial<StoredSpellbook>
      return {
        spells: Array.isArray(envelope.spells) ? envelope.spells.filter(isPersonalSpell) : [],
        profile: isSpellcasterProfile(envelope.profile) ? envelope.profile : null,
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
  const { spells, profile } = state

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

  const setProfile = useCallback((next: SpellcasterProfile | null) => {
    setState((prev) => ({ ...prev, profile: next }))
  }, [])

  const has = useCallback((index: string) => indices.has(index), [indices])

  return { spells, indices, profile, add, remove, toggle, has, setProfile }
}
