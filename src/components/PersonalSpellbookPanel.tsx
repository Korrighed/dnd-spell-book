import type { PersonalSpell } from '../hooks/usePersonalSpellbook'
import type { SpellListItem } from '../api/spells'
import type { SpellAccessCheck } from '../utils/spellAccess'
import { spellDisplayName, t } from '../utils/browserLanguage'
import { OutOfProfileLabel } from './OutOfProfileLabel'
import './PersonalSpellbookPanel.css'

interface PersonalSpellbookPanelProps {
  spells: PersonalSpell[]
  allSpells: SpellListItem[]
  selectedIndex: string | null
  onSelectSpell: (index: string) => void
  onRemoveSpell: (index: string) => void
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
}

export function PersonalSpellbookPanel({
  spells,
  allSpells,
  selectedIndex,
  onSelectSpell,
  onRemoveSpell,
  isAccessible,
}: PersonalSpellbookPanelProps) {
  const spellByIndex = new Map(allSpells.map((spell) => [spell.index, spell]))

  return (
    <section className="personal-spellbook">
      {/* La liste complete arrive de facon asynchrone : tant qu'elle est vide,
          aucun nom ne peut etre resolu, donc on n'affiche pas les sorts. */}
      {spells.length > 0 && allSpells.length > 0 && (
        <ul>
          {spells.map((personal) => {
            const spell = spellByIndex.get(personal.index)
            const isSelected = personal.index === selectedIndex
            // Un sort sauvegarde n'est jamais retire du grimoire : il est seulement grise.
            const outOfProfile =
              isAccessible !== null && spell !== undefined && !isAccessible(spell.index, spell.level)
            const className = [isSelected && 'selected', outOfProfile && 'out-of-profile']
              .filter(Boolean)
              .join(' ')
            // Une seule langue, comme SpellList.
            const name = spell ? spellDisplayName(spell) : personal.index

            return (
              <li key={personal.index} className={className || undefined}>
                <button
                  type="button"
                  className="open"
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => onSelectSpell(personal.index)}
                >
                  {spell && (
                    <span className="level">
                      {t('Niv.', 'Lvl')} {spell.level}
                    </span>
                  )}
                  <span className="name">{name}</span>
                  {outOfProfile && <OutOfProfileLabel />}
                </button>
                <button
                  type="button"
                  className="remove"
                  aria-label={t(
                    `Retirer ${name} du grimoire personnel`,
                    `Remove ${name} from personal spellbook`,
                  )}
                  onClick={() => onRemoveSpell(personal.index)}
                >
                  &times;
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
