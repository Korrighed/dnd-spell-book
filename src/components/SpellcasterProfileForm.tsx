import type { ClassListItem } from '../api/classes'
import {
  MAX_CHARACTER_LEVEL,
  MIN_CHARACTER_LEVEL,
  type SpellcasterProfile,
} from '../hooks/usePersonalSpellbook'

interface SpellcasterProfileFormProps {
  classes: ClassListItem[]
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
  profile,
  maxSpellLevel,
  loading,
  error,
  onChange,
}: SpellcasterProfileFormProps) {
  const hasLevel = profile !== null && profile.characterLevel !== null

  return (
    <div className="spellcaster-profile">
      <label>
        Classe <em>Class</em>{' '}
        <select
          value={profile?.classIndex ?? ''}
          onChange={(event) => {
            const classIndex = event.target.value
            // Changer de classe conserve le niveau. Retirer la classe efface tout le profil.
            onChange(
              classIndex ? { classIndex, characterLevel: profile?.characterLevel ?? null } : null,
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
            onChange({ ...profile, characterLevel: raw ? Number(raw) : null })
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
