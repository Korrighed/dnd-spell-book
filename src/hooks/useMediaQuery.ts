import { useSyncExternalStore } from 'react'

/** Meme seuil que les @media de BookSpread.css / *Panel.css. */
export const MOBILE_QUERY = '(max-width: 899px)'

/** Vrai tant que la media query correspond, mis a jour au redimensionnement. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
