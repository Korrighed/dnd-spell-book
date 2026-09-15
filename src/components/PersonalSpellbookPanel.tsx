import type { PersonalSpell } from '../hooks/usePersonalSpellbook'
import type { SpellListItem } from '../api/spells'
import './PersonalSpellbookPanel.css'

interface PersonalSpellbookPanelProps {
  spells: PersonalSpell[]
  allSpells: SpellListItem[]
  selectedIndex: string | null
  onSelectSpell: (index: string) => void
  onRemoveSpell: (index: string) => void
}

export function PersonalSpellbookPanel({
  spells,
  allSpells,
  selectedIndex,
  onSelectSpell,
  onRemoveSpell,
}: PersonalSpellbookPanelProps) {
  // La liste complete arrive de facon asynchrone : tant qu'elle est vide,
  // on ne peut resoudre aucun nom, donc on n'affiche rien plutot qu'un panneau vide.
  if (spells.length === 0 || allSpells.length === 0) {
    return null
  }

  const spellByIndex = new Map(allSpells.map((spell) => [spell.index, spell]))

  return (
    <section className="personal-spellbook">
      <h2>
        Grimoire personnel <em>Personal spellbook</em> ({spells.length})
      </h2>
      <ul>
        {spells.map((personal) => {
          const spell = spellByIndex.get(personal.index)
          const isSelected = personal.index === selectedIndex

          return (
            <li key={personal.index} className={isSelected ? 'selected' : undefined}>
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
    </section>
  )
}
