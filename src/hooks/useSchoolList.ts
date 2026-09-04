import { useEffect, useState } from 'react'
import { fetchSchoolList, type SchoolListItem } from '../api/schools'

interface UseSchoolListResult {
  schools: SchoolListItem[]
  loading: boolean
  error: string | null
}

export function useSchoolList(): UseSchoolListResult {
  const [schools, setSchools] = useState<SchoolListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSchoolList()
      .then(setSchools)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { schools, loading, error }
}
