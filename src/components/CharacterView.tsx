import { useEffect, useRef } from 'react'
import type { ClassListItem } from '../api/classes'
import type { ProfileSpellcastingInfo } from '../hooks/useMultiSpellAccess'
import type { SpellcasterProfile } from '../hooks/usePersonalSpellbook'
import { t } from '../utils/browserLanguage'
import {
  MAX_TOTAL_CHARACTER_LEVEL,
  maxLevelForProfile,
  totalSpecifiedLevel,
} from '../utils/characterLevels'
import { BookmarkView } from './BookmarkView'
import { CharacterSelector } from './CharacterSelector'
import { SpellcasterProfileForm } from './SpellcasterProfileForm'

interface CharacterViewProps {
  open: boolean
  onClose: () => void
  characters: { id: string; name: string }[]
  activeCharacterId: string
  onSelectCharacter: (id: string) => void
  onAddCharacter: (name: string) => void
  onRemoveCharacter: (id: string) => void
  onRenameCharacter: (id: string, name: string) => void
  spellcastingClasses: ClassListItem[]
  spellcastingClassesError: string | null
  profiles: SpellcasterProfile[]
  perProfile: ProfileSpellcastingInfo[]
  onSetProfile: (id: string, profile: SpellcasterProfile) => void
  onAddProfile: (profile: SpellcasterProfile) => void
  onRemoveProfile: (id: string) => void
}

/** Vue Personnage : personnages, puis leurs classes (niveau total plafonne a 20). */
export function CharacterView({
  open,
  onClose,
  characters,
  activeCharacterId,
  onSelectCharacter,
  onAddCharacter,
  onRemoveCharacter,
  onRenameCharacter,
  spellcastingClasses,
  spellcastingClassesError,
  profiles,
  perProfile,
  onSetProfile,
  onAddProfile,
  onRemoveProfile,
}: CharacterViewProps) {
  const totalLevel = totalSpecifiedLevel(profiles)
  const overCap = totalLevel > MAX_TOTAL_CHARACTER_LEVEL
  const classesRef = useRef<HTMLElement>(null)
  // Apres un retrait, le focus va sur la carte qui prend sa place.
  const focusCardIndex = useRef<number | null>(null)
  useEffect(() => {
    const index = focusCardIndex.current
    if (index === null) return
    focusCardIndex.current = null
    const cards = classesRef.current ? Array.from(classesRef.current.querySelectorAll('fieldset')) : []
    if (cards.length === 0) return
    const card = cards[Math.min(index, cards.length - 1)]
    // Liste « Classe » et non le bouton Retirer : deux Entree retireraient deux classes.
    card.querySelector<HTMLSelectElement>('select')?.focus()
  })

  return (
    <BookmarkView
      id="character"
      open={open}
      title={t('Personnage', 'Character')}
      onClose={onClose}
    >
      <CharacterSelector
        open={open}
        characters={characters}
        activeCharacterId={activeCharacterId}
        onSelect={onSelectCharacter}
        onAdd={onAddCharacter}
        onRemove={onRemoveCharacter}
        onRename={onRenameCharacter}
      />
      <section ref={classesRef} className="character-classes" aria-labelledby="character-classes-title">
        <h3 id="character-classes-title">{t('Classes', 'Classes')}</h3>
        <p className={overCap ? 'character-total character-total--over' : 'character-total'}>
          {overCap
            ? t(
                `Niveau total : ${totalLevel} / ${MAX_TOTAL_CHARACTER_LEVEL}, réduisez un niveau`,
                `Total level: ${totalLevel} / ${MAX_TOTAL_CHARACTER_LEVEL}, lower a level`,
              )
            : t(
                `Niveau total : ${totalLevel} / ${MAX_TOTAL_CHARACTER_LEVEL}`,
                `Total level: ${totalLevel} / ${MAX_TOTAL_CHARACTER_LEVEL}`,
              )}
        </p>
        {spellcastingClassesError && <p role="alert">{spellcastingClassesError}</p>}
        {profiles.map((profile, index) => (
          <SpellcasterProfileForm
            key={profile.id}
            classes={spellcastingClasses}
            profile={profile}
            maxSelectableLevel={maxLevelForProfile(profiles, profile.id)}
            maxSpellLevel={perProfile[index].maxSpellLevel}
            subclassSpellGrants={perProfile[index].subclassSpellGrants}
            loading={perProfile[index].loading}
            error={perProfile[index].error}
            onChange={(next) => {
              if (next) {
                onSetProfile(profile.id, next)
              } else {
                focusCardIndex.current = index
                onRemoveProfile(profile.id)
              }
            }}
          />
        ))}
        <SpellcasterProfileForm
          classes={spellcastingClasses}
          profile={null}
          maxSpellLevel={null}
          subclassSpellGrants={null}
          loading={false}
          error={null}
          onChange={(next) => {
            if (next) onAddProfile(next)
          }}
        />
      </section>
    </BookmarkView>
  )
}
