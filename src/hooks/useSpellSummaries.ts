import { useEffect, useRef, useState } from 'react'
import { fetchSpellSummary, type SpellSummary } from '../api/spellSummary'
import type { SpellListItem } from '../api/spells'

const STORAGE_KEY = 'dnd-spell-book:spell-summaries:v1'
/**
 * `fetchSpellSummary` fait 2 requetes (en + fr) par sort. Un catalogue complet
 * (~319 sorts) au premier chargement, meme en tache de fond, ne doit pas saturer
 * l'API tierce : le remplissage reste progressif, quelques sorts a la fois.
 */
const CONCURRENCY = 4

function loadCache(): Record<string, SpellSummary> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, SpellSummary>) : {}
  } catch {
    return {}
  }
}

/**
 * Cache persistant (localStorage) rempli progressivement en arriere-plan : la liste
 * affiche les sorts deja connus instantanement d'une session a l'autre, et rattrape
 * les nouveaux au fil des requetes plutot que de tout charger d'un coup.
 */
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
              // Quota localStorage depasse : le cache reste valide en memoire pour la session.
            }
            return next
          })
        } catch {
          // Sort ignore : reessaie au prochain montage plutot que de bloquer la file.
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
