import { fetchSchoolSpellIndices } from '../api/schools'
import { useIndexedSpellSet } from './useIndexedSpellSet'

export function useSchoolSpellIndices(schoolIndex: string | null) {
  return useIndexedSpellSet(schoolIndex, fetchSchoolSpellIndices)
}
