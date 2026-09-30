import type { SpellSummary } from '../api/spellSummary'
import type { SpellListItem } from '../api/spells'
import type { SpellAccessCheck } from '../utils/spellAccess'
import { detectBrowserLanguage } from '../utils/browserLanguage'
import { OutOfProfileLabel } from './OutOfProfileLabel'
import './SpellList.css'
import './SpellList.mobile.css'

interface SpellListProps {
  spells: SpellListItem[]
  onSelect: (index: string) => void
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
  /** Degats / JS / portee / forme, remplis en tache de fond. Absent tant que non charge. */
  summaries: Record<string, SpellSummary>
}

// Une seule langue par ligne, deduite du navigateur : contrairement a
// SpellDetail, la liste n'a pas de toggle FR/EN explicite, donc pas de FR+EN
// mixe possible ici. Constante au niveau module : la langue du navigateur ne
// change pas pendant la vie de l'application.
const LANGUAGE = detectBrowserLanguage()

export function SpellList({ spells, onSelect, isAccessible, summaries }: SpellListProps) {
  return (
    <ul className="spell-list">
      {spells.map((spell) => {
        const outOfProfile = isAccessible !== null && !isAccessible(spell.index, spell.level)
        const summary = summaries[spell.index]
        const name = LANGUAGE === 'fr' ? spell.nameFr : spell.name
        const damage = summary && (LANGUAGE === 'fr' ? summary.damageFr : summary.damageEn)

        return (
          <li key={spell.index} className={outOfProfile ? 'out-of-profile' : undefined}>
            <button type="button" onClick={() => onSelect(spell.index)}>
              <span className="level">
                {LANGUAGE === 'fr' ? 'Niv.' : 'Lvl'} {spell.level}
              </span>
              <span className="name">{name}</span>
              <span className="extra">
                {summary ? (
                  <>
                    {damage && <span className="damage">{damage}</span>}
                    {summary.saveAbility && (
                      <span className="save">
                        {LANGUAGE === 'fr' ? 'JS' : 'Save'} {summary.saveAbility}
                      </span>
                    )}
                    <span className="range">
                      {LANGUAGE === 'fr' ? summary.rangeFr : summary.rangeEn}
                    </span>
                    <span className="shape">
                      {LANGUAGE === 'fr' ? summary.shapeFr : summary.shapeEn}
                    </span>
                  </>
                ) : (
                  <span className="loading">…</span>
                )}
              </span>
              {outOfProfile && <OutOfProfileLabel />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
