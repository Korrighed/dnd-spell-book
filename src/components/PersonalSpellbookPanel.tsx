import type { ReactNode } from 'react'
import type { PersonalSpell } from '../hooks/usePersonalSpellbook'
import type { SpellListItem } from '../api/spells'
import type { SpellAccessCheck } from '../hooks/useSpellAccess'
import { OutOfProfileLabel } from './OutOfProfileLabel'
import './PersonalSpellbookPanel.css'

interface PersonalSpellbookPanelProps {
  spells: PersonalSpell[]
  allSpells: SpellListItem[]
  selectedIndex: string | null
  onSelectSpell: (index: string) => void
  onRemoveSpell: (index: string) => void
  /** Saisie du profil, affichee meme quand le grimoire est vide. */
  profileForm: ReactNode
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
}

export function PersonalSpellbookPanel({
  spells,
  allSpells,
  selectedIndex,
  onSelectSpell,
  onRemoveSpell,
  profileForm,
  isAccessible,
}: PersonalSpellbookPanelProps) {
  const spellByIndex = new Map(allSpells.map((spell) => [spell.index, spell]))

  return (
    <section className="personal-spellbook">
      <h2>
        Grimoire personnel <em>Personal spellbook</em> ({spells.length})
      </h2>

      {profileForm}

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

            return (
              <li key={personal.index} className={className || undefined}>
                <button
                  type="button"
                  className="open"
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => onSelectSpell(personal.index)}
                >
                  {spell ? (
                    <>
                      <span className="level">Niv. {spell.level}</span>
                      <span className="name-fr">{spell.nameFr}</span>
                      <span className="name-en">{spell.name}</span>
                      {outOfProfile && <OutOfProfileLabel />}
                    </>
                  ) : (
                    <span className="name-fr">{personal.index}</span>
                  )}
                </button>
                <button
                  type="button"
                  className="remove"
                  aria-label={`Retirer ${spell?.nameFr ?? personal.index} du grimoire personnel`}
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
