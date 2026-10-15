import type { ClassListItem } from '../api/classes'
import type { ProfileSpellcastingInfo } from '../hooks/useMultiSpellAccess'
import type { SpellcasterProfile } from '../hooks/usePersonalSpellbook'
import { t } from '../utils/browserLanguage'
import { BookmarkView } from './BookmarkView'
import { CharacterSelector } from './CharacterSelector'
import { SpellcasterProfileForm } from './SpellcasterProfileForm'

interface CharacterViewProps {
  open: boolean
  onClose: () => void
  /** Forme renvoyee par usePersonalSpellbook (id + nom seulement), pas `Character`. */
  characters: { id: string; name: string }[]
  activeCharacterId: string
  onSelectCharacter: (id: string) => void
  onAddCharacter: (name: string) => void
  onRemoveCharacter: (id: string) => void
  onRenameCharacter: (id: string, name: string) => void
  /** Classes lanceuses de sorts, et echec de leur chargement. */
  spellcastingClasses: ClassListItem[]
  spellcastingClassesError: string | null
  profiles: SpellcasterProfile[]
  /** Une entree par profil, meme ordre que `profiles`. */
  perProfile: ProfileSpellcastingInfo[]
  onSetProfile: (id: string, profile: SpellcasterProfile) => void
  onAddProfile: (profile: SpellcasterProfile) => void
  onRemoveProfile: (id: string) => void
}

/** Choix du personnage actif + un formulaire par classe + « ajouter une classe ». */
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
      {spellcastingClassesError && <p role="alert">{spellcastingClassesError}</p>}
      {profiles.map((profile, index) => (
        <SpellcasterProfileForm
          classes={spellcastingClasses}
          profile={profile}
          maxSpellLevel={perProfile[index].maxSpellLevel}
          subclassSpellGrants={perProfile[index].subclassSpellGrants}
          loading={perProfile[index].loading}
          error={perProfile[index].error}
          onChange={(next) =>
            next ? onSetProfile(profile.id, next) : onRemoveProfile(profile.id)
          }
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
    </BookmarkView>
  )
}
