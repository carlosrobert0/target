import { useRecurringTransactionDatabase } from '@/database/useRecurringTransactionDatabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'

export function useRemoveRecurring() {
  const { remove } = useRecurringTransactionDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível remover a recorrência.')
    },
  })
}
