import type { ClassListItem } from '../api/classes'
import type { SchoolListItem } from '../api/schools'
import { t } from '../utils/browserLanguage'
import type { SortMode } from '../utils/spellSort'
import { BookmarkView } from './BookmarkView'
import { SpellLevelFilter } from './SpellLevelFilter'
import { SpellClassFilter } from './SpellClassFilter'
import { SpellSchoolFilter } from './SpellSchoolFilter'

interface FiltersViewProps {
  open: boolean
  onClose: () => void
  levelFilter: number | null
  onLevelChange: (value: number | null) => void
  classes: ClassListItem[]
  classFilter: string | null
  onClassChange: (value: string | null) => void
  schools: SchoolListItem[]
  schoolFilter: string | null
  onSchoolChange: (value: string | null) => void
  sortMode: SortMode
  onSortChange: (value: SortMode) => void
  /** Echecs de chargement des listes deroulantes classes / ecoles. */
  classListError: string | null
  schoolListError: string | null
}

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'alpha', label: t('Ordre alphabétique', 'Alphabetical') },
  { mode: 'level', label: t('Par niveau', 'By level') },
]

/**
 * Filtres (niveau, classe, ecole de magie) et tri de la liste, dans une seule
 * vue : les deux reglent la meme liste. Un seul tri actif a la fois ; un tri
 * ne retire aucun sort, contrairement au filtre niveau.
 */
export function FiltersView({
  open,
  onClose,
  levelFilter,
  onLevelChange,
  classes,
  classFilter,
  onClassChange,
  schools,
  schoolFilter,
  onSchoolChange,
  sortMode,
  onSortChange,
  classListError,
  schoolListError,
}: FiltersViewProps) {
  return (
    <BookmarkView
      id="filters"
      open={open}
      title={t('Filtres et tri', 'Filters and sort')}
      onClose={onClose}
    >
      {/* className conserve : App.css cible #grimoire .filters. */}
      <div className="filters">
        <SpellLevelFilter value={levelFilter} onChange={onLevelChange} />
        <SpellClassFilter classes={classes} value={classFilter} onChange={onClassChange} />
        <SpellSchoolFilter schools={schools} value={schoolFilter} onChange={onSchoolChange} />
      </div>

      {classListError && <p role="alert">{classListError}</p>}
      {schoolListError && <p role="alert">{schoolListError}</p>}

      <fieldset className="filters-sort">
        <legend>{t('Trier la liste', 'Sort the list')}</legend>
        {SORT_OPTIONS.map((option) => (
          <label key={option.mode}>
            <input
              type="radio"
              name="sort-mode"
              value={option.mode}
              checked={sortMode === option.mode}
              onChange={() => onSortChange(option.mode)}
            />{' '}
            {option.label}
          </label>
        ))}
      </fieldset>
    </BookmarkView>
  )
}
