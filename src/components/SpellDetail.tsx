import type { SpellDetail as SpellDetailData, SpellTexts } from '../api/spellDetail'
import type { LanguageMode } from '../types/language'
import { Bilingual, BilingualParagraphs } from './Bilingual'
import { LanguageToggle } from './LanguageToggle'

interface SpellDetailProps {
  detail: SpellDetailData
  language: LanguageMode
  onLanguageChange: (mode: LanguageMode) => void
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

export function SpellDetail({ detail, language, onLanguageChange }: SpellDetailProps) {
  const { mechanics, en, fr } = detail
  const damageValue = mechanics.damage ? firstDamageValue(mechanics.damage.atSlotLevel) : null

  return (
    <section className="spell-detail">
      <LanguageToggle value={language} onChange={onLanguageChange} />

      <h2>
        <Bilingual mode={language} fr={fr.name} en={en.name} />
      </h2>

      <p>
        Niveau {mechanics.level} — <Bilingual mode={language} fr={fr.school} en={en.school} />
      </p>
      <p>
        Classes :{' '}
        <Bilingual mode={language} fr={fr.classes.join(', ')} en={en.classes.join(', ')} />
      </p>
      <p>
        Temps d'incantation :{' '}
        <Bilingual mode={language} fr={fr.castingTime} en={en.castingTime} />
      </p>
      <p>
        Portee : <Bilingual mode={language} fr={fr.range} en={en.range} />
      </p>
      <p>
        Duree : <Bilingual mode={language} fr={fr.duration} en={en.duration} />
      </p>
      <p>
        Composants : {mechanics.components.join(', ')}
        {en.material && (
          <>
            {' '}
            — <Bilingual mode={language} fr={fr.material ?? en.material} en={en.material} />
          </>
        )}
      </p>
      <p>
        Rituel : {mechanics.ritual ? 'Oui' : 'Non'} — Concentration :{' '}
        {mechanics.concentration ? 'Oui' : 'Non'}
      </p>

      {mechanics.damage && (
        <p>
          Degats : {damageValue}
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
          Jet de sauvegarde :{' '}
          <Bilingual mode={language} fr={fr.dcType ?? en.dcType} en={en.dcType} /> (
          {mechanics.dcSuccess})
        </p>
      )}

      {mechanics.areaOfEffect && (
        <p>
          Zone d'effet : {mechanics.areaOfEffect.type}, {mechanics.areaOfEffect.sizeMeters} m (
          {mechanics.areaOfEffect.sizeFeet} ft)
        </p>
      )}

      <div>
        <h3>Description</h3>
        <BilingualParagraphs mode={language} fr={fr.desc} en={en.desc} />
      </div>

      {en.higherLevel.length > 0 && (
        <div>
          <h3>Aux niveaux superieurs</h3>
          <BilingualParagraphs mode={language} fr={fr.higherLevel} en={en.higherLevel} />
        </div>
      )}

      <p>
        <small>Mis a jour le {new Date(mechanics.updatedAt).toLocaleDateString('fr-FR')}</small>
      </p>
    </section>
  )
}
