import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { queryClient } from '@/lib/query-client'
import { useMutation } from '@tanstack/react-query'
import { Alert } from 'react-native'

export function useRemoveTransactionById() {
  const { remove } = useTransactionDatabase()

  const mutation = useMutation({
    mutationFn: (id: number) => remove(id),
    onError: () => {
      Alert.alert('Erro', 'Não foi possível remover a transação.')
    },
  })

  return mutation
}
