import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface PersonalSpell {
  index: string
  addedAt: string
}

interface StoredSpellbook {
  version: number
  spells: PersonalSpell[]
}

const STORAGE_KEY = 'dnd-personal-spellbook'
const STORAGE_VERSION = 1

function isPersonalSpell(value: unknown): value is PersonalSpell {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.index === 'string' && typeof candidate.addedAt === 'string'
}

function readSpellbook(): PersonalSpell[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)

    // Format v0 : tableau brut, ecrit par les premieres versions du hook.
    if (Array.isArray(parsed)) return parsed.filter(isPersonalSpell)

    if (typeof parsed === 'object' && parsed !== null) {
      const envelope = parsed as Partial<StoredSpellbook>
      if (Array.isArray(envelope.spells)) return envelope.spells.filter(isPersonalSpell)
    }

    return []
  } catch {
    return []
  }
}

function writeSpellbook(spells: PersonalSpell[]) {
  try {
    const envelope: StoredSpellbook = { version: STORAGE_VERSION, spells }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    console.error('Impossible de sauvegarder le grimoire personnel.')
  }
}

export function usePersonalSpellbook() {
  const [spells, setSpells] = useState<PersonalSpell[]>(readSpellbook)
  const hydrated = useRef(false)

  const indices = useMemo(() => new Set(spells.map((spell) => spell.index)), [spells])

  useEffect(() => {
    // Pas d'ecriture au montage : on ne reecrit le stockage que sur un vrai changement.
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    writeSpellbook(spells)
  }, [spells])

  useEffect(() => {
    // L'evenement `storage` n'est emis que dans les AUTRES onglets, jamais dans celui
    // qui ecrit. Relire le stockage ici ne peut donc pas boucler avec l'effet d'ecriture.
    function handleStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== STORAGE_KEY) return
      setSpells(readSpellbook())
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const add = useCallback((index: string) => {
    setSpells((prev) => {
      if (prev.some((spell) => spell.index === index)) return prev
      return [...prev, { index, addedAt: new Date().toISOString() }]
    })
  }, [])

  const remove = useCallback((index: string) => {
    setSpells((prev) => prev.filter((spell) => spell.index !== index))
  }, [])

  const toggle = useCallback((index: string) => {
    setSpells((prev) => {
      if (prev.some((spell) => spell.index === index)) {
        return prev.filter((spell) => spell.index !== index)
      }
      return [...prev, { index, addedAt: new Date().toISOString() }]
    })
  }, [])

  const has = useCallback((index: string) => indices.has(index), [indices])

  return { spells, indices, add, remove, toggle, has }
}
