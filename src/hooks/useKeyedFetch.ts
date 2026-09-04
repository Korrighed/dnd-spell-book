import { useEffect, useState } from 'react'

interface UseKeyedFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useKeyedFetch<T>(
  key: string | null,
  fetcher: (key: string) => Promise<T>,
): UseKeyedFetchResult<T> {
  const [cache, setCache] = useState<Record<string, T>>({})
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

  const data = key === null ? null : (cache[key] ?? null)
  const error = key === null ? null : (errors[key] ?? null)
  const loading = key !== null && data === null && error === null

  return { data, loading, error }
}
