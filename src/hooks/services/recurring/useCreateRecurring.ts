import type { RecurringCreate } from '@/@types/recurring'
import { useRecurringTransactionDatabase } from '@/database/useRecurringTransactionDatabase'
import { useAchievementsWatcher } from '@/hooks/services/achievements/useAchievementsWatcher'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export function useCreateRecurring() {
  const { create } = useRecurringTransactionDatabase()
  const { onRecurringCreated } = useAchievementsWatcher()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RecurringCreate) => create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      try {
        await onRecurringCreated()
      } catch (e) {
        console.log('Achievement watcher error:', e)
      }
      Alert.alert('Recorrência', 'Recorrência criada com sucesso!', [
        { text: 'Ok', onPress: () => router.back() },
      ])
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível criar a recorrência.')
      console.log(error)
    },
  })
}
