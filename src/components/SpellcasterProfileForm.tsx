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
  /** Derive de useMultiSpellAccess cote App : evite un second fetch par bloc. */
  maxSpellLevel: number | null
  subclassSpellGrants: SubclassSpellGrant[] | null
  loading: boolean
  error: string | null
  /** `null` : retire ce bloc (classe deselectionnee ou bouton Effacer). */
  onChange: (profile: SpellcasterProfile | null) => void
}

const CHARACTER_LEVELS = Array.from(
  { length: MAX_CHARACTER_LEVEL - MIN_CHARACTER_LEVEL + 1 },
  (_, offset) => MIN_CHARACTER_LEVEL + offset,
)

/**
 * Un bloc classe/niveau/sous-classe/terrain. App.tsx en affiche un par entree
 * de `profiles`, plus un bloc vide pour ajouter une classe (multiclasse).
 * Charge lui-meme sa liste de sous-classes (donnee propre a ce bloc, non
 * partagee), mais recoit l'accessibilite calculee en amont : useMultiSpellAccess
 * fetche deja ces memes donnees pour le filtrage global, un second appel ici
 * dupliquerait les requetes et pourrait diverger en cas d'echec partiel.
 */
export function SpellcasterProfileForm({
  classes,
  profile,
  maxSpellLevel,
  subclassSpellGrants,
  loading,
  error,
  onChange,
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
  // Sans niveau precise, le profil est au niveau max : la sous-classe est forcement debloquee.
  const effectiveLevel = profile?.characterLevel ?? MAX_CHARACTER_LEVEL
  const subclassUnlocked = profile !== null && effectiveLevel >= subclassUnlockLevel

  // Distingue les boutons (aria-label) d'un bloc a l'autre en multiclasse : sans
  // ca, un lecteur d'ecran rencontre plusieurs boutons au meme intitule.
  const blockClass = classes.find((cls) => cls.index === profile?.classIndex)
  const blockLabel = blockClass ? t(blockClass.nameFr, blockClass.name) : t('nouvelle classe', 'new class')

  return (
    <fieldset className="spellcaster-profile">
      <legend>{profile ? blockLabel : t('Nouvelle classe', 'New class')}</legend>
      <label>
        {t('Classe', 'Class')}{' '}
        <select
          value={profile?.classIndex ?? ''}
          onChange={(event) => {
            const classIndex = event.target.value
            // Changer de classe conserve le niveau, mais efface la sous-classe :
            // elle est propre a l'ancienne classe. Retirer la classe retire ce bloc.
            // `id` : conserve celui du bloc existant ; pour un nouveau bloc (profile
            // null), la valeur est ignoree, addProfile assigne le vrai id.
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
          <option value="">{t('Aucune classe', 'No class')}</option>
          {classes.map((cls) => (
            <option key={cls.index} value={cls.index}>
              {t(cls.nameFr, cls.name)}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        aria-label={t(`Deselectionner la classe (${blockLabel})`, `Unselect class (${blockLabel})`)}
        disabled={!profile}
        onClick={() => onChange(null)}
      >
        &times;
      </button>{' '}
      <label>
        {t('Niveau', 'Level')}{' '}
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
          <option value="">{t('Niveau max', 'Max level')}</option>
          {CHARACTER_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        aria-label={t(`Deselectionner le niveau (${blockLabel})`, `Unselect level (${blockLabel})`)}
        disabled={!hasLevel}
        onClick={() => profile && onChange({ ...profile, characterLevel: null })}
      >
        &times;
      </button>{' '}
      {/*
        Le bloc reste visible tant que le profil a deja une sous-classe choisie,
        meme si la liste fraiche echoue ou est encore en chargement : sinon le
        dropdown ET son bouton de retrait disparaissent, alors que les sorts
        qu'elle accorde restent appliques en arriere-plan (rien pour les voir
        ni les retirer). L'option courante est alors affichee par son index
        brut, faute de mieux (nom localise indisponible sans la liste).
      */}
      {subclassUnlocked && (subclasses.length > 0 || profile?.subclassIndex) && (
        <>
          <label>
            {t('Sous-classe', 'Subclass')}{' '}
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
          <button
            type="button"
            aria-label={t(`Deselectionner la sous-classe (${blockLabel})`, `Unselect subclass (${blockLabel})`)}
            disabled={!profile?.subclassIndex}
            onClick={() =>
              profile && onChange({ ...profile, subclassIndex: null, subclassFeatureIndex: null })
            }
          >
            &times;
          </button>{' '}
          {subclasses.length === 0 && (
            <p role="alert">
              {subclassesError
                ? t(
                    `Liste des sous-classes indisponible (${subclassesError})`,
                    `Subclass list unavailable (${subclassesError})`,
                  )
                : subclassesLoading
                  ? t('Chargement de la liste des sous-classes...', 'Loading subclass list...')
                  : t(
                      'Sous-classe enregistree introuvable dans la liste actuelle.',
                      'Saved subclass not found in the current list.',
                    )}
            </p>
          )}
        </>
      )}
      {profile?.subclassIndex && subclassFeatureOptions.length > 0 && (
        <>
          <label>
            {t('Terrain', 'Terrain')}{' '}
            <select
              value={profile.subclassFeatureIndex ?? ''}
              onChange={(event) =>
                onChange({ ...profile, subclassFeatureIndex: event.target.value || null })
              }
            >
              <option value="">{t('Non precise', 'Unspecified')}</option>
              {subclassFeatureOptions.map((option) => (
                <option key={option.index} value={option.index}>
                  {t(option.nameFr, option.name)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-label={t(`Deselectionner le terrain (${blockLabel})`, `Unselect terrain (${blockLabel})`)}
            disabled={!profile.subclassFeatureIndex}
            onClick={() => onChange({ ...profile, subclassFeatureIndex: null })}
          >
            &times;
          </button>{' '}
        </>
      )}
      <button type="button" disabled={!profile} onClick={() => onChange(null)}>
        {t('Effacer', 'Clear')}
      </button>
      {profile && loading && <p>{t('Calcul des sorts accessibles...', 'Computing accessible spells...')}</p>}
      {profile && error && <p role="alert">{error}</p>}
      {profile && !loading && !error && (
        <p>
          {t('Niveau de sort max :', 'Max spell level:')} {hasLevel ? maxSpellLevel : t('tous', 'all')}
        </p>
      )}
    </fieldset>
  )
}
