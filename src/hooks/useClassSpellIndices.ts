import { useEffect, useState } from 'react'
import { fetchClassSpellIndices } from '../api/classes'

interface UseClassSpellIndicesResult {
  indices: Set<string> | null
  loading: boolean
  error: string | null
}

export function useClassSpellIndices(classIndex: string | null): UseClassSpellIndicesResult {
  const [cache, setCache] = useState<Record<string, Set<string>>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (classIndex === null || classIndex in cache || classIndex in errors) return

    let cancelled = false

    fetchClassSpellIndices(classIndex)
      .then((result) => {
        if (!cancelled) setCache((prev) => ({ ...prev, [classIndex]: result }))
      })
      .catch((err: Error) => {
        if (!cancelled) setErrors((prev) => ({ ...prev, [classIndex]: err.message }))
      })

    return () => {
      cancelled = true
    }
  }, [classIndex, cache, errors])

  const indices = classIndex === null ? null : (cache[classIndex] ?? null)
  const error = classIndex === null ? null : (errors[classIndex] ?? null)
  const loading = classIndex !== null && indices === null && error === null

  return { indices, loading, error }
}
