import type { ClassListItem } from '../api/classes'
import { DevFrame } from '../dev/DevFrame'
import type { ProfileSpellcastingInfo } from '../hooks/useMultiSpellAccess'
import type { SpellcasterProfile } from '../hooks/usePersonalSpellbook'
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
      title={
        <>
          Personnage <em>Character</em>
        </>
      }
      onClose={onClose}
    >
      <DevFrame name="CharacterSelector" uses={['usePersonalSpellbook']}>
        <CharacterSelector
          characters={characters}
          activeCharacterId={activeCharacterId}
          onSelect={onSelectCharacter}
          onAdd={onAddCharacter}
          onRemove={onRemoveCharacter}
          onRename={onRenameCharacter}
        />
      </DevFrame>
      {spellcastingClassesError && <p role="alert">{spellcastingClassesError}</p>}
      {profiles.map((profile, index) => (
        <DevFrame
          key={profile.id}
          name={`SpellcasterProfileForm (classe ${index + 1})`}
          uses={['usePersonalSpellbook', 'useSpellcastingClasses', 'useMultiSpellAccess']}
        >
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
        </DevFrame>
      ))}
      <DevFrame
        name="SpellcasterProfileForm (ajouter une classe)"
        uses={['usePersonalSpellbook', 'useSpellcastingClasses']}
      >
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
      </DevFrame>
    </BookmarkView>
  )
}
