import { useEffect, useRef, useState } from 'react'

interface UseMultiKeyedFetchResult<T> {
  data: Record<string, T>
  loading: boolean
  error: string | null
}

/** useKeyedFetch pour une liste de clefs de longueur variable (multiclasse). */
export function useMultiKeyedFetch<T>(
  keys: string[],
  fetcher: (key: string) => Promise<T>,
): UseMultiKeyedFetchResult<T> {
  const [cache, setCache] = useState<Record<string, T>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Clefs en vol : evite de relancer leur fetch a chaque resolution d'une autre.
  const inFlight = useRef<Set<string>>(new Set())

  const uniqueKeys = [...new Set(keys)]
  const keySignature = uniqueKeys.slice().sort().join('|')

  useEffect(() => {
    const currentKeys = keySignature === '' ? [] : keySignature.split('|')
    let cancelled = false

    for (const key of currentKeys) {
      if (key in cache || key in errors || inFlight.current.has(key)) continue
      inFlight.current.add(key)

      fetcher(key)
        .then((result) => {
          inFlight.current.delete(key)
          if (!cancelled) setCache((prev) => ({ ...prev, [key]: result }))
        })
        .catch((err: Error) => {
          inFlight.current.delete(key)
          if (!cancelled) setErrors((prev) => ({ ...prev, [key]: err.message }))
        })
    }

    return () => {
      cancelled = true
    }
  }, [keySignature, cache, errors, fetcher])

  const loading = uniqueKeys.some((key) => !(key in cache) && !(key in errors))
  const error = uniqueKeys.map((key) => errors[key]).find((message) => message) ?? null

  return { data: cache, loading, error }
}
