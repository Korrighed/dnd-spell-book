import { fetchSpellDetail } from '../api/spellDetail'
import { useKeyedFetch } from './useKeyedFetch'

export function useSpellDetail(index: string | null) {
  const { data, loading, error } = useKeyedFetch(index, fetchSpellDetail)
  return { detail: data, loading, error }
}
