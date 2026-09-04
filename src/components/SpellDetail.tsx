import type { SpellDetail as SpellDetailData } from '../api/spellDetail'

interface SpellDetailProps {
  detail: SpellDetailData
}

export function SpellDetail({ detail }: SpellDetailProps) {
  return (
    <section className="spell-detail">
      <h2>
        {detail.nameFr} <em>{detail.name}</em>
      </h2>

      <p>
        Niveau {detail.level} — {detail.schoolFr} <em>{detail.school}</em>
      </p>
      <p>
        Classes : {detail.classesFr.join(', ')} <em>({detail.classes.join(', ')})</em>
      </p>
      <p>
        Temps d'incantation : {detail.castingTimeFr} <em>{detail.castingTime}</em>
      </p>
      <p>
        Portee : {detail.rangeFr} <em>{detail.range}</em>
      </p>
      <p>
        Duree : {detail.durationFr} <em>{detail.duration}</em>
      </p>
      <p>
        Composants : {detail.components.join(', ')}
        {detail.material && (
          <>
            {' '}
            — {detail.materialFr} <em>{detail.material}</em>
          </>
        )}
      </p>
      <p>
        Rituel : {detail.ritual ? 'Oui' : 'Non'} — Concentration :{' '}
        {detail.concentration ? 'Oui' : 'Non'}
      </p>

      {detail.damage && (
        <p>
          Degats : {detail.damage.typeNameFr} <em>{detail.damage.typeName}</em>
          {detail.damage.atSlotLevel && (
            <> — {Object.entries(detail.damage.atSlotLevel).map(([lvl, dice]) => `niv.${lvl}: ${dice}`).join(', ')}</>
          )}
        </p>
      )}

      {detail.dc && (
        <p>
          Jet de sauvegarde : {detail.dc.typeNameFr} <em>{detail.dc.typeName}</em> ({detail.dc.success})
        </p>
      )}

      {detail.areaOfEffect && (
        <p>
          Zone d'effet : {detail.areaOfEffect.type}, {detail.areaOfEffect.sizeMeters} m{' '}
          <em>({detail.areaOfEffect.sizeFeet} ft)</em>
        </p>
      )}

      <div>
        <h3>Description</h3>
        {detail.descFr.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
        {detail.desc.map((paragraph, i) => (
          <p key={i}>
            <em>{paragraph}</em>
          </p>
        ))}
      </div>

      {detail.higherLevelFr.length > 0 && (
        <div>
          <h3>Aux niveaux superieurs</h3>
          {detail.higherLevelFr.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {detail.higherLevel.map((paragraph, i) => (
            <p key={i}>
              <em>{paragraph}</em>
            </p>
          ))}
        </div>
      )}

      <p>
        <small>Mis a jour le {new Date(detail.updatedAt).toLocaleDateString('fr-FR')}</small>
      </p>
    </section>
  )
}
