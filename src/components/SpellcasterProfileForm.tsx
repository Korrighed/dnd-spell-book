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
  return (
    <div className="spellcaster-profile">
      <label>
        Classe <em>Class</em>{' '}
        <select
          value={profile?.classIndex ?? ''}
          onChange={(event) => {
            const classIndex = event.target.value
            onChange(
              classIndex
                ? { classIndex, characterLevel: profile?.characterLevel ?? MIN_CHARACTER_LEVEL }
                : null,
            )
          }}
        >
          <option value="">Aucun profil (No profile)</option>
          {classes.map((cls) => (
            <option key={cls.index} value={cls.index}>
              {cls.nameFr} ({cls.name})
            </option>
          ))}
        </select>
      </label>{' '}
      <label>
        Niveau <em>Level</em>{' '}
        <select
          value={profile?.characterLevel ?? MIN_CHARACTER_LEVEL}
          disabled={!profile}
          onChange={(event) => {
            if (!profile) return
            onChange({ ...profile, characterLevel: Number(event.target.value) })
          }}
        >
          {CHARACTER_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>
      {profile && loading && <p>Calcul des sorts accessibles...</p>}
      {profile && error && <p role="alert">{error}</p>}
      {profile && maxSpellLevel !== null && (
        <p>
          Niveau de sort max : {maxSpellLevel} <em>Max spell level</em>
        </p>
      )}
    </div>
  )
}
