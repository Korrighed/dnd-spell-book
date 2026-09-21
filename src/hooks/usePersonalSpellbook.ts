import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface PersonalSpell {
  index: string
  addedAt: string
}

/** Personnage de reference : sert a deduire les sorts accessibles. */
export interface SpellcasterProfile {
  /** Identite stable du bloc, independante de sa position dans le tableau. */
  id: string
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

/** Un grimoire personnel = un personnage : ses sorts et ses classes (multiclasse) lui sont propres. */
export interface Character {
  id: string
  name: string
  spells: PersonalSpell[]
  profiles: SpellcasterProfile[]
}

interface RootState {
  characters: Character[]
  activeCharacterId: string
}

interface StoredRootState extends RootState {
  version: number
}

const STORAGE_KEY = 'dnd-personal-spellbook'
const STORAGE_VERSION = 4
const DEFAULT_CHARACTER_NAME = 'Personnage 1'

/**
 * Le personnage actif est propre A CET ONGLET : sessionStorage n'est jamais
 * partage entre onglets/fenetres (contrairement a localStorage), ce qui
 * permet d'ouvrir un personnage different dans chaque fenetre pour comparer.
 * Les DONNEES des personnages (`characters`), elles, restent dans le
 * localStorage partage : une modification faite dans un onglet doit se
 * retrouver dans l'autre si on y regarde le meme personnage.
 */
const ACTIVE_TAB_KEY = 'dnd-personal-spellbook:active-tab'

function readActiveCharacterIdForThisTab(characters: Character[], fallback: string): string {
  try {
    const stored = sessionStorage.getItem(ACTIVE_TAB_KEY)
    if (stored && characters.some((character) => character.id === stored)) return stored
  } catch {
    // sessionStorage indisponible (navigation privee stricte, etc.) : on retombe sur le defaut.
  }
  return characters.some((character) => character.id === fallback) ? fallback : characters[0].id
}

function writeActiveCharacterIdForThisTab(id: string) {
  try {
    sessionStorage.setItem(ACTIVE_TAB_KEY, id)
  } catch {
    // Rien de grave : la selection ne survivra juste pas a un rechargement de cet onglet.
  }
}

export const MIN_CHARACTER_LEVEL = 1
export const MAX_CHARACTER_LEVEL = 20

/**
 * `crypto.randomUUID` n'existe pas hors contexte securise (HTTPS/localhost)
 * ni sur les tres vieux navigateurs. Sans repli, l'exception remontait non
 * rattrapee jusqu'a l'initialiseur de useState (le catch de readSpellbook
 * rappelle createDefaultState, qui relance le meme throw hors du try) et
 * l'app entiere restait en ecran blanc.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function createCharacter(name: string): Character {
  return { id: generateId(), name, spells: [], profiles: [] }
}

function createDefaultState(): RootState {
  const character = createCharacter(DEFAULT_CHARACTER_NAME)
  return { characters: [character], activeCharacterId: character.id }
}

function isPersonalSpell(value: unknown): value is PersonalSpell {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.index === 'string' && typeof candidate.addedAt === 'string'
}

/**
 * Forme tolerante : `subclassIndex`/`subclassFeatureIndex` absents sur les
 * profils v2 anterieurs, `id` absent sur tous les profils avant l'ajout de
 * l'identite stable (voir SpellcasterProfile).
 */
interface StoredProfileShape {
  id?: unknown
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
    id: typeof stored.id === 'string' ? stored.id : generateId(),
    classIndex: stored.classIndex,
    characterLevel: stored.characterLevel,
    subclassIndex: stored.subclassIndex ?? null,
    subclassFeatureIndex: stored.subclassFeatureIndex ?? null,
  }
}

function parseProfiles(value: unknown): SpellcasterProfile[] {
  return Array.isArray(value) ? value.filter(isStoredProfile).map(normalizeProfile) : []
}

function parseSpells(value: unknown): PersonalSpell[] {
  return Array.isArray(value) ? value.filter(isPersonalSpell) : []
}

/** Forme tolerante d'un personnage stocke en v4. */
interface StoredCharacterShape {
  id?: unknown
  name?: unknown
  spells?: unknown
  profiles?: unknown
}

function isStoredCharacter(
  value: unknown,
): value is StoredCharacterShape & { id: string; name: string } {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.id === 'string' && typeof candidate.name === 'string'
}

function normalizeCharacter(stored: StoredCharacterShape & { id: string; name: string }): Character {
  return {
    id: stored.id,
    name: stored.name,
    spells: parseSpells(stored.spells),
    profiles: parseProfiles(stored.profiles),
  }
}

/** v1 (pas de profil) / v2 (un profil) / v3 (une liste de profils) : un seul personnage implicite. */
interface LegacyEnvelope {
  spells?: unknown
  profile?: unknown
  profiles?: unknown
  characters?: unknown
  activeCharacterId?: unknown
}

function readSpellbook(): RootState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return createDefaultState()

    const parsed: unknown = JSON.parse(stored)

    // Format v0 : tableau brut de sorts, ecrit par les premieres versions du hook.
    if (Array.isArray(parsed)) {
      const character = createCharacter(DEFAULT_CHARACTER_NAME)
      character.spells = parseSpells(parsed)
      return { characters: [character], activeCharacterId: character.id }
    }

    if (typeof parsed !== 'object' || parsed === null) return createDefaultState()

    const envelope = parsed as LegacyEnvelope

    // v4 : plusieurs personnages.
    if (Array.isArray(envelope.characters)) {
      const characters = envelope.characters.filter(isStoredCharacter).map(normalizeCharacter)
      if (characters.length === 0) return createDefaultState()
      const activeCharacterId =
        typeof envelope.activeCharacterId === 'string' &&
        characters.some((character) => character.id === envelope.activeCharacterId)
          ? envelope.activeCharacterId
          : characters[0].id
      return { characters, activeCharacterId }
    }

    // v1/v2/v3.
    const character: Character = {
      id: generateId(),
      name: DEFAULT_CHARACTER_NAME,
      spells: parseSpells(envelope.spells),
      profiles: Array.isArray(envelope.profiles)
        ? parseProfiles(envelope.profiles)
        : isStoredProfile(envelope.profile)
          ? [normalizeProfile(envelope.profile)]
          : [],
    }
    return { characters: [character], activeCharacterId: character.id }
  } catch {
    return createDefaultState()
  }
}

function writeSpellbook(state: RootState) {
  try {
    const envelope: StoredRootState = { version: STORAGE_VERSION, ...state }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    console.error('Impossible de sauvegarder le grimoire personnel.')
  }
}

function initState(): RootState {
  const stored = readSpellbook()
  return {
    characters: stored.characters,
    activeCharacterId: readActiveCharacterIdForThisTab(stored.characters, stored.activeCharacterId),
  }
}

export function usePersonalSpellbook() {
  const [state, setState] = useState<RootState>(initState)
  const hydrated = useRef(false)
  /**
   * Quand cet onglet reagit a un event `storage` venu d'un AUTRE onglet, il ne
   * doit rien reecrire : sinon chaque onglet reimpose son propre
   * `activeCharacterId` dans l'enveloppe partagee en reponse a l'ecriture de
   * l'autre, ce qui redeclenche un nouvel event `storage` en retour, et ainsi
   * de suite indefiniment des que deux onglets ont des personnages actifs
   * differents (exactement le cas d'usage vise par l'isolation par onglet).
   */
  const skipNextPersist = useRef(false)

  const activeCharacter =
    state.characters.find((character) => character.id === state.activeCharacterId) ??
    state.characters[0]
  const { spells, profiles } = activeCharacter

  const indices = useMemo(() => new Set(spells.map((spell) => spell.index)), [spells])

  useEffect(() => {
    // Pas d'ecriture au montage : on ne reecrit le stockage que sur un vrai changement.
    if (!hydrated.current) {
      hydrated.current = true
      return
    }
    // Etat recu d'un autre onglet via `storage` : deja coherent avec ce qui est
    // stocke, ne rien reecrire (voir le commentaire sur skipNextPersist).
    if (skipNextPersist.current) {
      skipNextPersist.current = false
      return
    }
    writeSpellbook(state)
    writeActiveCharacterIdForThisTab(state.activeCharacterId)
  }, [state])

  useEffect(() => {
    // L'evenement `storage` n'est emis que dans les AUTRES onglets, jamais dans celui
    // qui ecrit : recevoir cet event ne peut donc pas boucler avec l'ecriture de CET
    // onglet. Mais la mise a jour d'etat qu'il declenche ici peut, elle, redeclencher
    // l'effet d'ecriture ci-dessus si on ne la neutralise pas (skipNextPersist).
    // Seules les DONNEES des personnages sont reprises : le personnage actif reste
    // propre a cet onglet, sinon deux fenetres ouvertes sur deux personnages
    // differents se forceraient mutuellement a afficher le meme.
    function handleStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== STORAGE_KEY) return
      const fresh = readSpellbook()
      skipNextPersist.current = true
      setState((prev) => ({
        characters: fresh.characters,
        activeCharacterId: fresh.characters.some(
          (character) => character.id === prev.activeCharacterId,
        )
          ? prev.activeCharacterId
          : fresh.activeCharacterId,
      }))
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  /** Applique une mise a jour au personnage actif uniquement, jamais aux autres. */
  const updateActiveCharacter = useCallback((updater: (character: Character) => Character) => {
    setState((prev) => ({
      ...prev,
      characters: prev.characters.map((character) =>
        character.id === prev.activeCharacterId ? updater(character) : character,
      ),
    }))
  }, [])

  const add = useCallback(
    (index: string) => {
      updateActiveCharacter((character) => {
        if (character.spells.some((spell) => spell.index === index)) return character
        return {
          ...character,
          spells: [...character.spells, { index, addedAt: new Date().toISOString() }],
        }
      })
    },
    [updateActiveCharacter],
  )

  const remove = useCallback(
    (index: string) => {
      updateActiveCharacter((character) => ({
        ...character,
        spells: character.spells.filter((spell) => spell.index !== index),
      }))
    },
    [updateActiveCharacter],
  )

  const toggle = useCallback(
    (index: string) => {
      updateActiveCharacter((character) => {
        if (character.spells.some((spell) => spell.index === index)) {
          return { ...character, spells: character.spells.filter((spell) => spell.index !== index) }
        }
        return {
          ...character,
          spells: [...character.spells, { index, addedAt: new Date().toISOString() }],
        }
      })
    },
    [updateActiveCharacter],
  )

  const setProfileById = useCallback(
    (id: string, next: SpellcasterProfile) => {
      updateActiveCharacter((character) => ({
        ...character,
        profiles: character.profiles.map((profile) => (profile.id === id ? next : profile)),
      }))
    },
    [updateActiveCharacter],
  )

  const addProfile = useCallback(
    // L'id est assigne ici, pas par l'appelant : un evenement `storage` peut
    // remplacer le tableau `profiles` entre-temps, adresser par position
    // (l'ancien `setProfileAt`/`removeProfileAt`) ecrivait alors sur le mauvais bloc.
    (profile: SpellcasterProfile) => {
      updateActiveCharacter((character) => ({
        ...character,
        profiles: [...character.profiles, { ...profile, id: generateId() }],
      }))
    },
    [updateActiveCharacter],
  )

  const removeProfileById = useCallback(
    (id: string) => {
      updateActiveCharacter((character) => ({
        ...character,
        profiles: character.profiles.filter((profile) => profile.id !== id),
      }))
    },
    [updateActiveCharacter],
  )

  const has = useCallback((index: string) => indices.has(index), [indices])

  const setActiveCharacterId = useCallback((id: string) => {
    setState((prev) =>
      prev.characters.some((character) => character.id === id)
        ? { ...prev, activeCharacterId: id }
        : prev,
    )
  }, [])

  const addCharacter = useCallback((name: string) => {
    setState((prev) => {
      const character = createCharacter(name)
      return { characters: [...prev.characters, character], activeCharacterId: character.id }
    })
  }, [])

  const removeCharacter = useCallback((id: string) => {
    setState((prev) => {
      const remaining = prev.characters.filter((character) => character.id !== id)
      // Toujours au moins un personnage : en retirer le dernier en recree un vide.
      if (remaining.length === 0) {
        return createDefaultState()
      }
      const activeCharacterId =
        prev.activeCharacterId === id ? remaining[0].id : prev.activeCharacterId
      return { characters: remaining, activeCharacterId }
    })
  }, [])

  const renameCharacter = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      characters: prev.characters.map((character) =>
        character.id === id ? { ...character, name } : character,
      ),
    }))
  }, [])

  return {
    spells,
    indices,
    profiles,
    add,
    remove,
    toggle,
    has,
    setProfileById,
    addProfile,
    removeProfileById,
    characters: state.characters.map(({ id, name }) => ({ id, name })),
    activeCharacterId: activeCharacter.id,
    setActiveCharacterId,
    addCharacter,
    removeCharacter,
    renameCharacter,
  }
}
