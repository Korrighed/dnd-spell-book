import { useEffect, useState } from 'react'

interface UseMultiKeyedFetchResult<T> {
  data: Record<string, T>
  loading: boolean
  error: string | null
}

/**
 * Variante de useKeyedFetch pour plusieurs clefs a la fois (dedoublonnees).
 * Necessaire pour le multiclasse : on ne peut pas appeler useKeyedFetch dans
 * une boucle dont la longueur varie (regle des hooks React).
 */
export function useMultiKeyedFetch<T>(
  keys: string[],
  fetcher: (key: string) => Promise<T>,
): UseMultiKeyedFetchResult<T> {
  const [cache, setCache] = useState<Record<string, T>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const uniqueKeys = [...new Set(keys)]
  const keySignature = uniqueKeys.slice().sort().join('|')

  useEffect(() => {
    const missing = keySignature === '' ? [] : keySignature.split('|').filter((key) => !(key in cache) && !(key in errors))
    if (missing.length === 0) return

    let cancelled = false

    for (const key of missing) {
      fetcher(key)
        .then((result) => {
          if (!cancelled) setCache((prev) => ({ ...prev, [key]: result }))
        })
        .catch((err: Error) => {
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
