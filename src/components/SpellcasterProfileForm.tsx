import { useMemo } from 'react'
import type { ClassListItem } from '../api/classes'
import type { SubclassFeatureOption, SubclassSpellGrant } from '../api/subclasses'
import { getSubclassUnlockLevel } from '../data/subclassUnlockLevel'
import {
  MAX_CHARACTER_LEVEL,
  MIN_CHARACTER_LEVEL,
  type SpellcasterProfile,
} from '../hooks/usePersonalSpellbook'
import { useClassSubclasses } from '../hooks/useClassSubclasses'
import { t } from '../utils/browserLanguage'
import './SpellcasterProfileForm.css'

interface SpellcasterProfileFormProps {
  classes: ClassListItem[]
  profile: SpellcasterProfile | null
  /** Calcule par useMultiSpellAccess dans App. */
  maxSpellLevel: number | null
  subclassSpellGrants: SubclassSpellGrant[] | null
  loading: boolean
  error: string | null
  /** `null` : retire ce bloc. */
  onChange: (profile: SpellcasterProfile | null) => void
  /** Plus haut niveau proposable (plafond de niveau total, utils/characterLevels.ts). */
  maxSelectableLevel?: number
}

const CHARACTER_LEVELS = Array.from(
  { length: MAX_CHARACTER_LEVEL - MIN_CHARACTER_LEVEL + 1 },
  (_, offset) => MIN_CHARACTER_LEVEL + offset,
)

/**
 * Carte de classe : classe, niveau, sous-classe, terrain. Une par profil, plus
 * une carte vide pour ajouter une classe.
 */
export function SpellcasterProfileForm({
  classes,
  profile,
  maxSpellLevel,
  subclassSpellGrants,
  loading,
  error,
  onChange,
  maxSelectableLevel = MAX_CHARACTER_LEVEL,
}: SpellcasterProfileFormProps) {
  const {
    subclasses,
    loading: subclassesLoading,
    error: subclassesError,
  } = useClassSubclasses(profile?.classIndex ?? null)

  const subclassFeatureOptions = useMemo(() => {
    if (!subclassSpellGrants) return []
    const seen = new Map<string, SubclassFeatureOption>()
    for (const grant of subclassSpellGrants) {
      if (grant.feature && !seen.has(grant.feature.index)) seen.set(grant.feature.index, grant.feature)
    }
    return [...seen.values()]
  }, [subclassSpellGrants])

  const hasLevel = profile !== null && profile.characterLevel !== null
  const subclassUnlockLevel = profile ? getSubclassUnlockLevel(profile.classIndex) : MAX_CHARACTER_LEVEL
  // Sans niveau precise : niveau max, sous-classe debloquee.
  const effectiveLevel = profile?.characterLevel ?? MAX_CHARACTER_LEVEL
  const subclassUnlocked = profile !== null && effectiveLevel >= subclassUnlockLevel

  // Distingue les aria-label d'une carte a l'autre en multiclasse.
  const blockClass = classes.find((cls) => cls.index === profile?.classIndex)
  const blockLabel = blockClass ? t(blockClass.nameFr, blockClass.name) : t('nouvelle classe', 'new class')

  // Le niveau actuel reste proposable meme au-dela du plafond (donnees anciennes).
  const levelOptions = CHARACTER_LEVELS.filter(
    (level) => level <= maxSelectableLevel || level === profile?.characterLevel,
  )
  const capReached = profile !== null && !hasLevel && maxSelectableLevel === 0

  function accessText(): string {
    if (!hasLevel) {
      return t(
        'Sorts accessibles : tous les niveaux (niveau non précisé)',
        'Accessible spells: all levels (level unspecified)',
      )
    }
    if (maxSpellLevel === null) return t('Sorts accessibles : inconnu', 'Accessible spells: unknown')
    if (maxSpellLevel === 0) {
      return t(
        'Sorts accessibles : aucun emplacement de sort à ce niveau',
        'Accessible spells: no spell slot at this level',
      )
    }
    return t(
      `Sorts accessibles : jusqu'au niveau ${maxSpellLevel}`,
      `Accessible spells: up to level ${maxSpellLevel}`,
    )
  }

  const title = profile ? blockLabel : t('Ajouter une classe (multiclasse)', 'Add a class (multiclass)')

  return (
    <fieldset className={profile ? 'spellcaster-profile' : 'spellcaster-profile spellcaster-profile--add'}>
      {/* Legende masquee pour le nom accessible ; titre visible dans l'en-tete. */}
      <legend className="visually-hidden">{title}</legend>
      <div className="spellcaster-profile-header">
        <p className="spellcaster-profile-title" aria-hidden="true">
          {title}
        </p>
        {profile && (
          <button
            type="button"
            className="view-button"
            aria-label={t(`Retirer la classe ${blockLabel}`, `Remove class ${blockLabel}`)}
            onClick={() => onChange(null)}
          >
            {t('Retirer', 'Remove')}
          </button>
        )}
      </div>

      <div className="spellcaster-profile-fields">
        <label>
          {t('Classe', 'Class')}
          <select
            value={profile?.classIndex ?? ''}
            onChange={(event) => {
              const classIndex = event.target.value
              // Changer de classe garde le niveau et efface la sous-classe.
              // Nouveau bloc : l'id est assigne par addProfile.
              onChange(
                classIndex
                  ? {
                      id: profile?.id ?? '',
                      classIndex,
                      characterLevel: profile?.characterLevel ?? null,
                      subclassIndex: null,
                      subclassFeatureIndex: null,
                    }
                  : null,
              )
            }}
          >
            {profile === null && <option value="">{t('Choisir une classe', 'Choose a class')}</option>}
            {classes.map((cls) => (
              <option key={cls.index} value={cls.index}>
                {t(cls.nameFr, cls.name)}
              </option>
            ))}
          </select>
        </label>

        {profile && (
          <label>
            {t('Niveau', 'Level')}
            <select
              value={profile.characterLevel ?? ''}
              onChange={(event) => {
                if (!profile) return
                const raw = event.target.value
                const characterLevel = raw ? Number(raw) : null
                // Sous le seuil de deblocage, la sous-classe est retiree.
                const stillUnlocked = characterLevel === null || characterLevel >= subclassUnlockLevel
                onChange({
                  ...profile,
                  characterLevel,
                  subclassIndex: stillUnlocked ? profile.subclassIndex : null,
                  subclassFeatureIndex: stillUnlocked ? profile.subclassFeatureIndex : null,
                })
              }}
            >
              <option value="">{t('Niveau non précisé (tous les sorts)', 'Unspecified level (all spells)')}</option>
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Visible si une sous-classe est deja choisie, meme si la liste
            echoue : sinon impossible de la retirer. */}
        {subclassUnlocked && (subclasses.length > 0 || profile?.subclassIndex) && (
          <label>
            {t('Sous-classe', 'Subclass')}
            <select
              value={profile?.subclassIndex ?? ''}
              onChange={(event) => {
                if (!profile) return
                const subclassIndex = event.target.value || null
                // Changer de sous-classe efface le sous-choix (terrain, etc.).
                onChange({ ...profile, subclassIndex, subclassFeatureIndex: null })
              }}
            >
              <option value="">{t('Aucune sous-classe', 'No subclass')}</option>
              {subclasses.length > 0
                ? subclasses.map((sub) => (
                    <option key={sub.index} value={sub.index}>
                      {t(sub.nameFr, sub.name)}
                    </option>
                  ))
                : profile?.subclassIndex && (
                    <option value={profile.subclassIndex}>{profile.subclassIndex}</option>
                  )}
            </select>
          </label>
        )}

        {profile?.subclassIndex && subclassFeatureOptions.length > 0 && (
          <label>
            {t('Terrain', 'Terrain')}
            <select
              value={profile.subclassFeatureIndex ?? ''}
              onChange={(event) =>
                onChange({ ...profile, subclassFeatureIndex: event.target.value || null })
              }
            >
              <option value="">{t('Non précisé', 'Unspecified')}</option>
              {subclassFeatureOptions.map((option) => (
                <option key={option.index} value={option.index}>
                  {t(option.nameFr, option.name)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {subclassUnlocked && subclasses.length === 0 && profile?.subclassIndex && (
        subclassesLoading && !subclassesError ? (
          <p role="status">{t('Chargement de la liste des sous-classes…', 'Loading subclass list…')}</p>
        ) : (
          <p role="alert">
            {subclassesError
              ? t(
                  `Liste des sous-classes indisponible (${subclassesError})`,
                  `Subclass list unavailable (${subclassesError})`,
                )
              : t(
                  'Sous-classe enregistrée introuvable dans la liste actuelle.',
                  'Saved subclass not found in the current list.',
                )}
          </p>
        )
      )}
      {capReached && (
        <p>{t('Niveau total de 20 atteint : seul « non précisé » reste possible.', 'Total level 20 reached: only “unspecified” is left.')}</p>
      )}
      {profile && loading && <p role="status">{t('Calcul des sorts accessibles…', 'Computing accessible spells…')}</p>}
      {profile && error && <p role="alert">{error}</p>}
      {profile && !loading && !error && <p className="spellcaster-profile-access">{accessText()}</p>}
    </fieldset>
  )
}
