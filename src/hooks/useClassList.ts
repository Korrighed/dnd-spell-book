import { useEffect, useState } from 'react'
import { fetchClassList, type ClassListItem } from '../api/classes'

interface UseClassListResult {
  classes: ClassListItem[]
  loading: boolean
  error: string | null
}

export function useClassList(): UseClassListResult {
  const [classes, setClasses] = useState<ClassListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClassList()
      .then(setClasses)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { classes, loading, error }
}
