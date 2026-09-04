import { useEffect, useState } from 'react'
import { fetchSpellList, type SpellListItem } from '../api/spells'

interface UseSpellListResult {
  spells: SpellListItem[]
  loading: boolean
  error: string | null
}

export function useSpellList(): UseSpellListResult {
  const [spells, setSpells] = useState<SpellListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSpellList()
      .then(setSpells)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { spells, loading, error }
}
