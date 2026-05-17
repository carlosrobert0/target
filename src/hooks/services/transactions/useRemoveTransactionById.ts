import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'

export function useRemoveTransactionById() {
  const { remove } = useTransactionDatabase()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: number) => remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summaryTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['search'] })
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível remover a transação.')
    },
  })

  return mutation
}
