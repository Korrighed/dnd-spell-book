import type { ClassListItem } from '../api/classes'
import type { SchoolListItem } from '../api/schools'
import { DevFrame } from '../dev/DevFrame'
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
  /** Echecs de chargement des listes deroulantes classes / ecoles. */
  classListError: string | null
  schoolListError: string | null
}

/** Niveau, classe, ecole de magie. */
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
  classListError,
  schoolListError,
}: FiltersViewProps) {
  return (
    <BookmarkView
      id="filters"
      open={open}
      title={
        <>
          Filtres <em>Filters</em>
        </>
      }
      onClose={onClose}
    >
      {/* className conserve : App.css cible #grimoire .filters. */}
      <div className="filters">
        <DevFrame name="SpellLevelFilter" uses={['state:filtres']}>
          <SpellLevelFilter value={levelFilter} onChange={onLevelChange} />
        </DevFrame>
        <DevFrame name="SpellClassFilter" uses={['state:filtres', 'useClassList']}>
          <SpellClassFilter classes={classes} value={classFilter} onChange={onClassChange} />
        </DevFrame>
        <DevFrame name="SpellSchoolFilter" uses={['state:filtres', 'useSchoolList']}>
          <SpellSchoolFilter schools={schools} value={schoolFilter} onChange={onSchoolChange} />
        </DevFrame>
      </div>

      {classListError && <p role="alert">{classListError}</p>}
      {schoolListError && <p role="alert">{schoolListError}</p>}
    </BookmarkView>
  )
}
