import type { SpellDetail as SpellDetailData, SpellTexts } from '../api/spellDetail'
import { AOE_LABELS_FR } from '../api/spellSummary'
import type { LanguageMode } from '../types/language'
import { Bilingual, BilingualParagraphs } from './Bilingual'
import { LanguageToggle } from './LanguageToggle'
import { SpellbookToggle } from './SpellbookToggle'
import { BROWSER_LANGUAGE, t } from '../utils/browserLanguage'
import { formatFeet, formatRange } from '../utils/distance'

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

      {/* En-tete en liste : une information par puce. Rituel et Concentration
          n'apparaissent que si le sort les a. */}
      <ul className="spell-facts">
        <li>
          <strong>{t('Niveau :', 'Level:')}</strong> {mechanics.level} —{' '}
          <Bilingual mode={language} fr={fr.school} en={en.school} />
        </li>
        <li>
          <strong>{t('Classes :', 'Classes:')}</strong>{' '}
          <Bilingual mode={language} fr={fr.classes.join(', ')} en={en.classes.join(', ')} />
        </li>
        <li>
          <strong>{t("Temps d'incantation :", 'Casting time:')}</strong>{' '}
          <Bilingual mode={language} fr={fr.castingTime} en={en.castingTime} />
        </li>
        <li>
          <strong>{t('Portée :', 'Range:')}</strong> {formatRange(en.range, fr.range, language)}
        </li>
        <li>
          <strong>{t('Durée :', 'Duration:')}</strong>{' '}
          <Bilingual mode={language} fr={fr.duration} en={en.duration} />
        </li>
        <li>
          <strong>{t('Composants :', 'Components:')}</strong> {mechanics.components.join(', ')}
          {en.material && (
            <>
              {' '}
              — <Bilingual mode={language} fr={fr.material ?? en.material} en={en.material} />
            </>
          )}
        </li>
        {mechanics.ritual && (
          <li>
            <strong>{t('Rituel', 'Ritual')}</strong>
          </li>
        )}
        {mechanics.concentration && (
          <li>
            <strong>{t('Concentration', 'Concentration')}</strong>
          </li>
        )}
        {mechanics.damage && (
          <li>
            <strong>{t('Dégâts :', 'Damage:')}</strong> {damageValue}
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
          </li>
        )}
        {en.dcType && (
          <li>
            <strong>{t('Jet de sauvegarde :', 'Saving throw:')}</strong>{' '}
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
          </li>
        )}
        {mechanics.areaOfEffect && (
          <li>
            <strong>{t("Zone d'effet :", 'Area of effect:')}</strong>{' '}
            <Bilingual
              mode={language}
              fr={(AOE_LABELS_FR[mechanics.areaOfEffect.type] ?? mechanics.areaOfEffect.type).toLowerCase()}
              en={mechanics.areaOfEffect.type}
            />
            , {formatFeet(mechanics.areaOfEffect.sizeFeet, language)}
          </li>
        )}
      </ul>

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
