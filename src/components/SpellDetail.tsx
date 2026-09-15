import type { SpellDetail as SpellDetailData } from '../api/spellDetail'
import type { LanguageMode } from '../types/language'
import { Bilingual, BilingualParagraphs } from './Bilingual'
import { LanguageToggle } from './LanguageToggle'

interface SpellDetailProps {
  detail: SpellDetailData
  language: LanguageMode
  onLanguageChange: (mode: LanguageMode) => void
}

function baseDamageValue(atSlotLevel: Record<string, string> | null): string | null {
  if (!atSlotLevel) return null
  return Object.values(atSlotLevel)[0] ?? null
}

export function SpellDetail({ detail, language, onLanguageChange }: SpellDetailProps) {
  const damageValue = detail.damage ? baseDamageValue(detail.damage.atSlotLevel) : null

  return (
    <section className="spell-detail">
      <LanguageToggle value={language} onChange={onLanguageChange} />

      <h2>
        <Bilingual mode={language} fr={detail.nameFr} en={detail.name} />
      </h2>

      <p>
        Niveau {detail.level} — <Bilingual mode={language} fr={detail.schoolFr} en={detail.school} />
      </p>
      <p>
        Classes :{' '}
        <Bilingual mode={language} fr={detail.classesFr.join(', ')} en={detail.classes.join(', ')} />
      </p>
      <p>
        Temps d'incantation :{' '}
        <Bilingual mode={language} fr={detail.castingTimeFr} en={detail.castingTime} />
      </p>
      <p>
        Portee : <Bilingual mode={language} fr={detail.rangeFr} en={detail.range} />
      </p>
      <p>
        Duree : <Bilingual mode={language} fr={detail.durationFr} en={detail.duration} />
      </p>
      <p>
        Composants : {detail.components.join(', ')}
        {detail.material && (
          <>
            {' '}
            — <Bilingual mode={language} fr={detail.materialFr ?? ''} en={detail.material} />
          </>
        )}
      </p>
      <p>
        Rituel : {detail.ritual ? 'Oui' : 'Non'} — Concentration :{' '}
        {detail.concentration ? 'Oui' : 'Non'}
      </p>

      {detail.damage && (
        <p>
          Degats : {damageValue}{' '}
          <Bilingual mode={language} fr={detail.damage.typeNameFr} en={detail.damage.typeName} />
        </p>
      )}

      {detail.dc && (
        <p>
          Jet de sauvegarde :{' '}
          <Bilingual mode={language} fr={detail.dc.typeNameFr} en={detail.dc.typeName} /> (
          {detail.dc.success})
        </p>
      )}

      {detail.areaOfEffect && (
        <p>
          Zone d'effet : {detail.areaOfEffect.type}, {detail.areaOfEffect.sizeMeters} m (
          {detail.areaOfEffect.sizeFeet} ft)
        </p>
      )}

      <div>
        <h3>Description</h3>
        <BilingualParagraphs mode={language} fr={detail.descFr} en={detail.desc} />
      </div>

      {detail.higherLevelFr.length > 0 && (
        <div>
          <h3>Aux niveaux superieurs</h3>
          <BilingualParagraphs mode={language} fr={detail.higherLevelFr} en={detail.higherLevel} />
        </div>
      )}

      <p>
        <small>Mis a jour le {new Date(detail.updatedAt).toLocaleDateString('fr-FR')}</small>
      </p>
    </section>
  )
}
