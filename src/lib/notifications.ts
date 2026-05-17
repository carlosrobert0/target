import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const DAILY_REMINDER_ID = 'daily-reminder'

export async function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
    }),
  })

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Cofrin',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    })
  }
}

export async function ensurePermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync()
  if (settings.granted) return true
  const ask = await Notifications.requestPermissionsAsync()
  return ask.granted
}

export async function scheduleDailyReminder(hour: number, minute: number) {
  await cancelDailyReminder()
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: 'Registre seus gastos de hoje',
      body: 'Mantenha a meta no caminho. Toque pra adicionar uma transação.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })
}

export async function cancelDailyReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID)
  } catch {
    // identifier may not exist — ignore
  }
}

export async function scheduleOneoff(title: string, body: string, delaySeconds = 3) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySeconds),
    },
  })
}
