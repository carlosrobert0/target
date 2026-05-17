import type { TargetCreate } from '@/@types/target'
import { useTargetDatabase } from '@/database/useTargetDatabase'
import { useAchievementsWatcher } from '@/hooks/services/achievements/useAchievementsWatcher'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSQLiteContext } from 'expo-sqlite'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export function useCreateTarget() {
  const { create } = useTargetDatabase()
  const database = useSQLiteContext()
  const queryClient = useQueryClient()
  const { onTargetCreated } = useAchievementsWatcher()

  const mutation = useMutation({
    mutationFn: (data: TargetCreate) => create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] })
      try {
        const row = await database.getFirstAsync<{ n: number }>(
          `SELECT COUNT(*) AS n FROM targets WHERE archived_at IS NULL`,
        )
        await onTargetCreated(row?.n ?? 0)
      } catch (e) {
        console.log('Achievement watcher error:', e)
      }
      Alert.alert('Nova Meta', 'Meta criada com sucesso!', [
        { text: 'Ok', onPress: () => router.back() },
      ])
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível criar a meta.')
      console.log(error)
    },
  })

  return mutation
}
