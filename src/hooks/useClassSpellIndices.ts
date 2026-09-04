import { fetchClassSpellIndices } from '../api/classes'
import { useKeyedFetch } from './useKeyedFetch'

export function useClassSpellIndices(classIndex: string | null) {
  const { data, loading, error } = useKeyedFetch(classIndex, fetchClassSpellIndices)
  return { indices: data, loading, error }
}
