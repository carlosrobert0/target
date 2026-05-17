import { useSQLiteContext } from 'expo-sqlite'

export type NotificationSettings = {
  daily_reminder_enabled: number
  daily_reminder_hour: number
  daily_reminder_minute: number
  budget_alert_enabled: number
  budget_alert_threshold: number
  achievement_alert_enabled: number
}

export function useNotificationSettingsDatabase() {
  const database = useSQLiteContext()

  async function load() {
    const result = await database.getFirstAsync<NotificationSettings>(
      `SELECT * FROM notification_settings WHERE id = 1`,
    )
    return (
      result ?? {
        daily_reminder_enabled: 0,
        daily_reminder_hour: 20,
        daily_reminder_minute: 0,
        budget_alert_enabled: 1,
        budget_alert_threshold: 80,
        achievement_alert_enabled: 1,
      }
    )
  }

  async function update(data: Partial<NotificationSettings>) {
    const statement = await database.prepareAsync(`
      UPDATE notification_settings SET
        daily_reminder_enabled = COALESCE($daily_reminder_enabled, daily_reminder_enabled),
        daily_reminder_hour = COALESCE($daily_reminder_hour, daily_reminder_hour),
        daily_reminder_minute = COALESCE($daily_reminder_minute, daily_reminder_minute),
        budget_alert_enabled = COALESCE($budget_alert_enabled, budget_alert_enabled),
        budget_alert_threshold = COALESCE($budget_alert_threshold, budget_alert_threshold),
        achievement_alert_enabled = COALESCE($achievement_alert_enabled, achievement_alert_enabled),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `)
    await statement.executeAsync({
      $daily_reminder_enabled: data.daily_reminder_enabled ?? null,
      $daily_reminder_hour: data.daily_reminder_hour ?? null,
      $daily_reminder_minute: data.daily_reminder_minute ?? null,
      $budget_alert_enabled: data.budget_alert_enabled ?? null,
      $budget_alert_threshold: data.budget_alert_threshold ?? null,
      $achievement_alert_enabled: data.achievement_alert_enabled ?? null,
    })
  }

  async function log(kind: string, payload?: object) {
    const statement = await database.prepareAsync(`
      INSERT INTO notification_log (kind, payload) VALUES ($kind, $payload)
    `)
    await statement.executeAsync({
      $kind: kind,
      $payload: payload ? JSON.stringify(payload) : null,
    })
  }

  async function getLastFiredAt(kind: string) {
    const result = await database.getFirstAsync<{ fired_at: string }>(
      `SELECT fired_at FROM notification_log WHERE kind = ? ORDER BY fired_at DESC LIMIT 1`,
      [kind],
    )
    return result?.fired_at ?? null
  }

  return { load, update, log, getLastFiredAt }
}
