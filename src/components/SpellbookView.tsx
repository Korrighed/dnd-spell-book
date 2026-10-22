import type { SpellListItem } from '../api/spells'
import type { PersonalSpell } from '../hooks/usePersonalSpellbook'
import type { SpellAccessCheck } from '../utils/spellAccess'
import { t } from '../utils/browserLanguage'
import { BookmarkView } from './BookmarkView'
import { PersonalSpellbookPanel } from './PersonalSpellbookPanel'

/** « de Gandalf », « d'Elminster » : elision devant une voyelle ou un h. */
function frenchOf(name: string): string {
  return /^[aeiouyhàâäéèêëîïôöùûüœæ]/i.test(name) ? `d’${name}` : `de ${name}`
}

interface SpellbookViewProps {
  open: boolean
  onClose: () => void
  characterName: string
  spells: PersonalSpell[]
  allSpells: SpellListItem[]
  selectedIndex: string | null
  onSelectSpell: (index: string) => void
  onRemoveSpell: (index: string) => void
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
}

/** Grimoire du personnage actif. */
export function SpellbookView({
  open,
  onClose,
  characterName,
  spells,
  allSpells,
  selectedIndex,
  onSelectSpell,
  onRemoveSpell,
  isAccessible,
}: SpellbookViewProps) {
  const heading = characterName
    ? t(`Grimoire ${frenchOf(characterName)}`, `${characterName}'s spellbook`)
    : t('Grimoire personnel', 'Personal spellbook')

  return (
    <BookmarkView
      id="spellbook"
      open={open}
      title={`${heading} (${spells.length})`}
      onClose={onClose}
    >
      <PersonalSpellbookPanel
        spells={spells}
        allSpells={allSpells}
        selectedIndex={selectedIndex}
        onSelectSpell={onSelectSpell}
        onRemoveSpell={onRemoveSpell}
        isAccessible={isAccessible}
      />
    </BookmarkView>
  )
}
