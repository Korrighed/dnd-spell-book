import type { SpellSummary } from '../api/spellSummary'
import type { SpellListItem } from '../api/spells'
import type { SpellAccessCheck } from '../utils/spellAccess'
import { BROWSER_LANGUAGE as LANGUAGE, spellDisplayName } from '../utils/browserLanguage'
import { OutOfProfileLabel } from './OutOfProfileLabel'
import './SpellList.css'
import './SpellList.mobile.css'

interface SpellListProps {
  spells: SpellListItem[]
  onSelect: (index: string) => void
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
  /** Degats, JS, portee, forme : remplis en arriere-plan. */
  summaries: Record<string, SpellSummary>
}

export function SpellList({ spells, onSelect, isAccessible, summaries }: SpellListProps) {
  return (
    <ul className="spell-list">
      {spells.map((spell) => {
        const outOfProfile = isAccessible !== null && !isAccessible(spell.index, spell.level)
        const summary = summaries[spell.index]
        const name = spellDisplayName(spell)
        const damage = summary && (LANGUAGE === 'fr' ? summary.damageFr : summary.damageEn)

        return (
          <li key={spell.index} className={outOfProfile ? 'out-of-profile' : undefined}>
            <button type="button" onClick={() => onSelect(spell.index)}>
              <span className="level">
                {LANGUAGE === 'fr' ? 'Niv.' : 'Lvl'} {spell.level}
              </span>
              {/* Espace de largeur nulle apres « / » : coupure sur la barre. */}
              <span className="name">{name.replaceAll('/', '/​')}</span>
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
