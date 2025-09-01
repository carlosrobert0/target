import { useTargetDatabase } from '@/database/useTargetDatabase'
import { useQuery } from '@tanstack/react-query'

export function useGetTargetById(id: number) {
  const { show } = useTargetDatabase()
  const { data, isLoading, error } = useQuery({
    queryKey: ['targetById', id],
    queryFn: () => show(id),
  })

  return { data, isLoading, error }
}
