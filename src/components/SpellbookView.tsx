import type { SpellListItem } from '../api/spells'
import type { PersonalSpell } from '../hooks/usePersonalSpellbook'
import type { SpellAccessCheck } from '../utils/spellAccess'
import { t } from '../utils/browserLanguage'
import { BookmarkView } from './BookmarkView'
import { PersonalSpellbookPanel } from './PersonalSpellbookPanel'

interface SpellbookViewProps {
  open: boolean
  onClose: () => void
  spells: PersonalSpell[]
  allSpells: SpellListItem[]
  selectedIndex: string | null
  onSelectSpell: (index: string) => void
  onRemoveSpell: (index: string) => void
  /** `null` : aucun profil, rien n'est grise. */
  isAccessible: SpellAccessCheck | null
}

/** Liste du grimoire du personnage actif. Le compteur est dans le titre de la vue. */
export function SpellbookView({
  open,
  onClose,
  spells,
  allSpells,
  selectedIndex,
  onSelectSpell,
  onRemoveSpell,
  isAccessible,
}: SpellbookViewProps) {
  return (
    <BookmarkView
      id="spellbook"
      open={open}
      title={`${t('Grimoire personnel', 'Personal spellbook')} (${spells.length})`}
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
