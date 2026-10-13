import type { ReactNode } from 'react'
import { DevFrame } from '../dev/DevFrame'
import type { SortMode } from '../utils/spellSort'
import { BookmarkView } from './BookmarkView'

interface SortViewProps {
  open: boolean
  onClose: () => void
  value: SortMode
  onChange: (value: SortMode) => void
}

const SORT_OPTIONS: { mode: SortMode; label: ReactNode }[] = [
  {
    mode: 'alpha',
    label: (
      <>
        Ordre alphabetique <em>Alphabetical</em>
      </>
    ),
  },
  {
    mode: 'level',
    label: (
      <>
        Par niveau <em>By level</em>
      </>
    ),
  },
]

/** Un seul tri actif a la fois. Un tri ne retire aucun sort (contrairement au filtre niveau). */
export function SortView({ open, onClose, value, onChange }: SortViewProps) {
  return (
    <BookmarkView
      id="sort"
      open={open}
      title={
        <>
          Tri <em>Sort</em>
        </>
      }
      onClose={onClose}
    >
      <DevFrame name="SortView (radios)" uses={['state:sortMode']}>
        <fieldset>
          <legend>
            Trier la liste <em>Sort the list</em>
          </legend>
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
