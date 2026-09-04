import { fetchSchoolSpellIndices } from '../api/schools'
import { useKeyedFetch } from './useKeyedFetch'

export function useSchoolSpellIndices(schoolIndex: string | null) {
  const { data, loading, error } = useKeyedFetch(schoolIndex, fetchSchoolSpellIndices)
  return { indices: data, loading, error }
}
