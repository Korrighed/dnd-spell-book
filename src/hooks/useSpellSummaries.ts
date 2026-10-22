import { useEffect, useRef, useState } from 'react'
import { fetchSpellSummary, type SpellSummary } from '../api/spellSummary'
import type { SpellListItem } from '../api/spells'

const STORAGE_KEY = 'dnd-spell-book:spell-summaries:v2'
const LEGACY_STORAGE_KEY = 'dnd-spell-book:spell-summaries:v1'
/** Requetes simultanees au plus, pour ne pas saturer l'API (2 requetes par sort). */
const CONCURRENCY = 4

function loadCache(): Record<string, SpellSummary> {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, SpellSummary>) : {}
  } catch {
    return {}
  }
}

/** Resumes des sorts de la liste, en cache localStorage, completes en arriere-plan. */
export function useSpellSummaries(spells: SpellListItem[]): Record<string, SpellSummary> {
  const [summaries, setSummaries] = useState<Record<string, SpellSummary>>(loadCache)
  const cacheRef = useRef(summaries)

  useEffect(() => {
    cacheRef.current = summaries
  }, [summaries])

  useEffect(() => {
    if (spells.length === 0) return

    const queue = spells
      .map((spell) => spell.index)
      .filter((index) => !(index in cacheRef.current))
    if (queue.length === 0) return

    let cancelled = false

    async function worker() {
      while (!cancelled) {
        const index = queue.shift()
        if (index === undefined) return

        try {
          const summary = await fetchSpellSummary(index)
          if (cancelled) return
          setSummaries((prev) => {
            const next = { ...prev, [index]: summary }
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            } catch {
              // Quota depasse : cache en memoire seulement.
            }
            return next
          })
        } catch {
          // Sort ignore, retente au prochain chargement.
        }
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker())
    void Promise.all(workers)

    return () => {
      cancelled = true
    }
  }, [spells])

  return summaries
}
