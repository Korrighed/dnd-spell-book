import { fetchClassSpellIndices } from '../api/classes'
import { useIndexedSpellSet } from './useIndexedSpellSet'

export function useClassSpellIndices(classIndex: string | null) {
  return useIndexedSpellSet(classIndex, fetchClassSpellIndices)
}
