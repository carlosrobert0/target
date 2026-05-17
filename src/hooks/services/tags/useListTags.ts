import { useTagDatabase } from '@/database/useTagDatabase'
import { useQuery } from '@tanstack/react-query'

export function useListTags() {
  const { list } = useTagDatabase()
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => list(),
  })
}
