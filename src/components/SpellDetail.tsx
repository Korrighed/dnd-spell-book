import type { SpellDetail as SpellDetailData, SpellTexts } from '../api/spellDetail'
import { AOE_LABELS_FR } from '../api/spellSummary'
import type { LanguageMode } from '../types/language'
import { Bilingual, BilingualParagraphs } from './Bilingual'
import { LanguageToggle } from './LanguageToggle'
import { SpellbookToggle } from './SpellbookToggle'
import { BROWSER_LANGUAGE, t } from '../utils/browserLanguage'

interface SpellDetailProps {
  detail: SpellDetailData
  language: LanguageMode
  onLanguageChange: (mode: LanguageMode) => void
  inSpellbook: boolean
  onToggleSpellbook: (index: string) => void
  /** Sort hors du profil du lanceur : fiche lisible, signalee et grisee. */
  outOfProfile: boolean
}

/**
 * Effet d'un jet de sauvegarde reussi (`dc.dc_success`) : jamais traduit par
 * l'API, meme sur le payload fr-FR.
 */
const DC_SUCCESS_FR: Record<string, string> = {
  none: 'aucun effet',
  half: 'moitié des dégâts',
  other: 'voir la description',
}

function firstDamageValue(atSlotLevel: Record<string, string> | null): string | null {
  if (!atSlotLevel) return null
  return Object.values(atSlotLevel)[0] ?? null
}

/**
 * L'API n'expose le nom du type de degats que dans le payload fr-FR.
 * Cote anglais on retombe donc sur l'index technique ("fire" -> "Fire").
 */
function damageTypeLabel(texts: SpellTexts, typeIndex: string): string {
  if (texts.damageTypeName) return texts.damageTypeName
  return typeIndex.charAt(0).toUpperCase() + typeIndex.slice(1)
}

export function SpellDetail({
  detail,
  language,
  onLanguageChange,
  inSpellbook,
  onToggleSpellbook,
  outOfProfile,
}: SpellDetailProps) {
  const { mechanics, en, fr } = detail
  const damageValue = mechanics.damage ? firstDamageValue(mechanics.damage.atSlotLevel) : null

  return (
    <section className={outOfProfile ? 'spell-detail out-of-profile' : 'spell-detail'}>
      {outOfProfile && (
        <p role="note">
          {t(
            'Ce sort ne correspond pas à votre profil de lanceur.',
            'This spell is outside your spellcaster profile.',
          )}
        </p>
      )}

      <LanguageToggle value={language} onChange={onLanguageChange} />

      <SpellbookToggle
        inSpellbook={inSpellbook}
        onToggle={() => onToggleSpellbook(mechanics.index)}
      />

      <h2>
        <Bilingual mode={language} fr={fr.name} en={en.name} />
      </h2>

      <p>
        {t('Niveau', 'Level')} {mechanics.level} — <Bilingual mode={language} fr={fr.school} en={en.school} />
      </p>
      <p>
        {t('Classes :', 'Classes:')}{' '}
        <Bilingual mode={language} fr={fr.classes.join(', ')} en={en.classes.join(', ')} />
      </p>
      <p>
        {t("Temps d'incantation :", 'Casting time:')}{' '}
        <Bilingual mode={language} fr={fr.castingTime} en={en.castingTime} />
      </p>
      <p>
        {t('Portée :', 'Range:')} <Bilingual mode={language} fr={fr.range} en={en.range} />
      </p>
      <p>
        {t('Durée :', 'Duration:')} <Bilingual mode={language} fr={fr.duration} en={en.duration} />
      </p>
      <p>
        {t('Composants :', 'Components:')} {mechanics.components.join(', ')}
        {en.material && (
          <>
            {' '}
            — <Bilingual mode={language} fr={fr.material ?? en.material} en={en.material} />
          </>
        )}
      </p>
      <p>
        {t('Rituel :', 'Ritual:')} {mechanics.ritual ? t('Oui', 'Yes') : t('Non', 'No')} —{' '}
        {t('Concentration :', 'Concentration:')}{' '}
        {mechanics.concentration ? t('Oui', 'Yes') : t('Non', 'No')}
      </p>

      {mechanics.damage && (
        <p>
          {t('Dégâts :', 'Damage:')} {damageValue}
          {mechanics.damage.typeIndex && (
            <>
              {' '}
              <Bilingual
                mode={language}
                fr={damageTypeLabel(fr, mechanics.damage.typeIndex)}
                en={damageTypeLabel(en, mechanics.damage.typeIndex)}
              />
            </>
          )}
        </p>
      )}

      {en.dcType && (
        <p>
          {t('Jet de sauvegarde :', 'Saving throw:')}{' '}
          <Bilingual mode={language} fr={fr.dcType ?? en.dcType} en={en.dcType} />
          {mechanics.dcSuccess && (
            <>
              {' '}(
              <Bilingual
                mode={language}
                fr={DC_SUCCESS_FR[mechanics.dcSuccess] ?? mechanics.dcSuccess}
                en={mechanics.dcSuccess}
              />
              )
            </>
          )}
        </p>
      )}

      {mechanics.areaOfEffect && (
        <p>
          {t("Zone d'effet :", 'Area of effect:')}{' '}
          <Bilingual
            mode={language}
            fr={(AOE_LABELS_FR[mechanics.areaOfEffect.type] ?? mechanics.areaOfEffect.type).toLowerCase()}
            en={mechanics.areaOfEffect.type}
          />
          , {mechanics.areaOfEffect.sizeMeters} m (
          {mechanics.areaOfEffect.sizeFeet} ft)
        </p>
      )}

      <div>
        <h3>{t('Description', 'Description')}</h3>
        <BilingualParagraphs mode={language} fr={fr.desc} en={en.desc} />
      </div>

      {en.higherLevel.length > 0 && (
        <div>
          <h3>{t('Aux niveaux supérieurs', 'At higher levels')}</h3>
          <BilingualParagraphs mode={language} fr={fr.higherLevel} en={en.higherLevel} />
        </div>
      )}

      <p>
        <small>
          {t('Mis à jour le', 'Updated on')}{' '}
          {new Date(mechanics.updatedAt).toLocaleDateString(BROWSER_LANGUAGE === 'fr' ? 'fr-FR' : 'en-US')}
        </small>
      </p>
    </section>
  )
}
