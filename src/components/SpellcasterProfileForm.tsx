import type { ClassListItem } from '../api/classes'
import type { SubclassFeatureOption, SubclassListItem } from '../api/subclasses'
import {
  MAX_CHARACTER_LEVEL,
  MIN_CHARACTER_LEVEL,
  type SpellcasterProfile,
} from '../hooks/usePersonalSpellbook'

interface SpellcasterProfileFormProps {
  classes: ClassListItem[]
  subclasses: SubclassListItem[]
  /** Niveau auquel la classe du profil debloque sa sous-classe. Sans effet sans profil. */
  subclassUnlockLevel: number
  /** Options du sous-choix de la sous-classe (ex. terrain du Cercle de la Terre). Vide sinon. */
  subclassFeatureOptions: SubclassFeatureOption[]
  profile: SpellcasterProfile | null
  maxSpellLevel: number | null
  loading: boolean
  error: string | null
  onChange: (profile: SpellcasterProfile | null) => void
}

const CHARACTER_LEVELS = Array.from(
  { length: MAX_CHARACTER_LEVEL - MIN_CHARACTER_LEVEL + 1 },
  (_, offset) => MIN_CHARACTER_LEVEL + offset,
)

export function SpellcasterProfileForm({
  classes,
  subclasses,
  subclassUnlockLevel,
  subclassFeatureOptions,
  profile,
  maxSpellLevel,
  loading,
  error,
  onChange,
}: SpellcasterProfileFormProps) {
  const hasLevel = profile !== null && profile.characterLevel !== null
  // Sans niveau precise, le profil est au niveau max : la sous-classe est forcement debloquee.
  const effectiveLevel = profile?.characterLevel ?? MAX_CHARACTER_LEVEL
  const subclassUnlocked = profile !== null && effectiveLevel >= subclassUnlockLevel

  return (
    <div className="spellcaster-profile">
      <label>
        Classe <em>Class</em>{' '}
        <select
          value={profile?.classIndex ?? ''}
          onChange={(event) => {
            const classIndex = event.target.value
            // Changer de classe conserve le niveau, mais efface la sous-classe :
            // elle est propre a l'ancienne classe. Retirer la classe efface tout le profil.
            onChange(
              classIndex
                ? {
                    classIndex,
                    characterLevel: profile?.characterLevel ?? null,
                    subclassIndex: null,
                    subclassFeatureIndex: null,
                  }
                : null,
            )
          }}
        >
          <option value="">Aucune classe (No class)</option>
          {classes.map((cls) => (
            <option key={cls.index} value={cls.index}>
              {cls.nameFr} ({cls.name})
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        aria-label="Deselectionner la classe"
        disabled={!profile}
        onClick={() => onChange(null)}
      >
        &times;
      </button>{' '}
      <label>
        Niveau <em>Level</em>{' '}
        <select
          value={profile?.characterLevel ?? ''}
          disabled={!profile}
          onChange={(event) => {
            if (!profile) return
            const raw = event.target.value
            const characterLevel = raw ? Number(raw) : null
            // Repasser sous le seuil de deblocage retire la sous-classe :
            // le personnage ne l'a pas encore a ce niveau.
            const stillUnlocked = characterLevel === null || characterLevel >= subclassUnlockLevel
            onChange({
              ...profile,
              characterLevel,
              subclassIndex: stillUnlocked ? profile.subclassIndex : null,
              subclassFeatureIndex: stillUnlocked ? profile.subclassFeatureIndex : null,
            })
          }}
        >
          <option value="">Niveau max (Max level)</option>
          {CHARACTER_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        aria-label="Deselectionner le niveau"
        disabled={!hasLevel}
        onClick={() => profile && onChange({ ...profile, characterLevel: null })}
      >
        &times;
      </button>{' '}
      {subclassUnlocked && subclasses.length > 0 && (
        <>
          <label>
            Sous-classe <em>Subclass</em>{' '}
            <select
              value={profile?.subclassIndex ?? ''}
              onChange={(event) => {
                if (!profile) return
                const subclassIndex = event.target.value || null
                // Changer de sous-classe efface le sous-choix (terrain, etc.).
                onChange({ ...profile, subclassIndex, subclassFeatureIndex: null })
              }}
            >
              <option value="">Aucune sous-classe (No subclass)</option>
              {subclasses.map((sub) => (
                <option key={sub.index} value={sub.index}>
                  {sub.nameFr} ({sub.name})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-label="Deselectionner la sous-classe"
            disabled={!profile?.subclassIndex}
            onClick={() =>
              profile && onChange({ ...profile, subclassIndex: null, subclassFeatureIndex: null })
            }
          >
            &times;
          </button>{' '}
        </>
      )}
      {profile?.subclassIndex && subclassFeatureOptions.length > 0 && (
        <>
          <label>
            Terrain <em>Terrain</em>{' '}
            <select
              value={profile.subclassFeatureIndex ?? ''}
              onChange={(event) =>
                onChange({ ...profile, subclassFeatureIndex: event.target.value || null })
              }
            >
              <option value="">Non precise (Unspecified)</option>
              {subclassFeatureOptions.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.nameFr} ({option.name})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-label="Deselectionner le terrain"
            disabled={!profile.subclassFeatureIndex}
            onClick={() => onChange({ ...profile, subclassFeatureIndex: null })}
          >
            &times;
          </button>{' '}
        </>
      )}
      <button type="button" disabled={!profile} onClick={() => onChange(null)}>
        Effacer <em>Clear</em>
      </button>
      {profile && loading && <p>Calcul des sorts accessibles...</p>}
      {profile && error && <p role="alert">{error}</p>}
      {profile && !loading && !error && (
        <p>
          Niveau de sort max : {hasLevel ? maxSpellLevel : 'tous'} <em>Max spell level</em>
        </p>
      )}
    </div>
  )
}
