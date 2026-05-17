import { useRecurringTransactionDatabase } from '@/database/useRecurringTransactionDatabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useToggleRecurring() {
  const { setActive } = useRecurringTransactionDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => setActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })
}
