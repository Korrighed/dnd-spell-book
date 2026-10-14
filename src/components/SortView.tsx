import { DevFrame } from '../dev/DevFrame'
import { t } from '../utils/browserLanguage'
import type { SortMode } from '../utils/spellSort'
import { BookmarkView } from './BookmarkView'

interface SortViewProps {
  open: boolean
  onClose: () => void
  value: SortMode
  onChange: (value: SortMode) => void
}

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'alpha', label: t('Ordre alphabetique', 'Alphabetical') },
  { mode: 'level', label: t('Par niveau', 'By level') },
]

/** Un seul tri actif a la fois. Un tri ne retire aucun sort (contrairement au filtre niveau). */
export function SortView({ open, onClose, value, onChange }: SortViewProps) {
  return (
    <BookmarkView id="sort" open={open} title={t('Tri', 'Sort')} onClose={onClose}>
      <DevFrame name="SortView (radios)" uses={['state:sortMode']}>
        <fieldset>
          <legend>{t('Trier la liste', 'Sort the list')}</legend>
          {SORT_OPTIONS.map((option) => (
            <label key={option.mode}>
              <input
                type="radio"
                name="sort-mode"
                value={option.mode}
                checked={value === option.mode}
                onChange={() => onChange(option.mode)}
              />{' '}
              {option.label}
            </label>
          ))}
        </fieldset>
      </DevFrame>
    </BookmarkView>
  )
}
