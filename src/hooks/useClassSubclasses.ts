import { fetchClassSubclasses } from '../api/subclasses'
import { useKeyedFetch } from './useKeyedFetch'

export function useClassSubclasses(classIndex: string | null) {
  const { data, loading, error } = useKeyedFetch(classIndex, fetchClassSubclasses)
  return { subclasses: data ?? [], loading, error }
}
