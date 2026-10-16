import { useEffect, useMemo, useState } from 'react'
import { fetchSpellcastingClassIndices, type ClassListItem } from '../api/classes'

/** Filtre la liste des classes sur celles qui lancent des sorts. */
export function useSpellcastingClasses(classes: ClassListItem[]) {
  const [casterIndices, setCasterIndices] = useState<Set<string> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (classes.length === 0) return

    let cancelled = false

    fetchSpellcastingClassIndices(classes.map((cls) => cls.index))
      .then((indices) => {
        if (!cancelled) setCasterIndices(indices)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [classes])

  const spellcastingClasses = useMemo(
    () => (casterIndices ? classes.filter((cls) => casterIndices.has(cls.index)) : []),
    [classes, casterIndices],
  )

  return { spellcastingClasses, error }
}
