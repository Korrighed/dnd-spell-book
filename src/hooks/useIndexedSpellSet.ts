import { useEffect, useState } from 'react'

interface UseIndexedSpellSetResult {
  indices: Set<string> | null
  loading: boolean
  error: string | null
}

export function useIndexedSpellSet(
  key: string | null,
  fetcher: (key: string) => Promise<Set<string>>,
): UseIndexedSpellSetResult {
  const [cache, setCache] = useState<Record<string, Set<string>>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (key === null || key in cache || key in errors) return

    let cancelled = false

    fetcher(key)
      .then((result) => {
        if (!cancelled) setCache((prev) => ({ ...prev, [key]: result }))
      })
      .catch((err: Error) => {
        if (!cancelled) setErrors((prev) => ({ ...prev, [key]: err.message }))
      })

    return () => {
      cancelled = true
    }
  }, [key, cache, errors, fetcher])

  const indices = key === null ? null : (cache[key] ?? null)
  const error = key === null ? null : (errors[key] ?? null)
  const loading = key !== null && indices === null && error === null

  return { indices, loading, error }
}
