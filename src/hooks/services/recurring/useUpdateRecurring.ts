import type { RecurringCreate } from '@/@types/recurring'
import { useRecurringTransactionDatabase } from '@/database/useRecurringTransactionDatabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export function useUpdateRecurring() {
  const { update } = useRecurringTransactionDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RecurringCreate> }) =>
      update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      Alert.alert('Recorrência', 'Recorrência atualizada com sucesso!', [
        { text: 'Ok', onPress: () => router.back() },
      ])
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível atualizar a recorrência.')
    },
  })
}
