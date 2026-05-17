import { useNotificationSettingsDatabase } from '@/database/useNotificationSettingsDatabase'
import type { NotificationSettings } from '@/database/useNotificationSettingsDatabase'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'
import {
  cancelDailyReminder,
  ensurePermission,
  scheduleDailyReminder,
} from '@/lib/notifications'

const QUERY_KEY = ['notification_settings']

export function useNotificationSettings() {
  const { load } = useNotificationSettingsDatabase()
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => load(),
  })
}

export function useUpdateNotificationSettings() {
  const { update } = useNotificationSettingsDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<NotificationSettings>) => {
      if (data.daily_reminder_enabled === 1) {
        const granted = await ensurePermission()
        if (!granted) {
          throw new Error('permission-denied')
        }
        await scheduleDailyReminder(
          data.daily_reminder_hour ?? 20,
          data.daily_reminder_minute ?? 0,
        )
      }
      if (data.daily_reminder_enabled === 0) {
        await cancelDailyReminder()
      }
      await update(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (error: Error) => {
      if (error.message === 'permission-denied') {
        Alert.alert(
          'Permissão necessária',
          'Habilite notificações nas configurações do sistema para receber lembretes.',
        )
      } else {
        Alert.alert('Erro', 'Não foi possível salvar as configurações.')
      }
    },
  })
}
