import { useNotificationSettingsDatabase } from '@/database/useNotificationSettingsDatabase'
import { useTargetDatabase } from '@/database/useTargetDatabase'
import { scheduleOneoff } from '@/lib/notifications'

export function useAchievementWatcher() {
  const { load, log, getLastFiredAt } = useNotificationSettingsDatabase()
  const { show } = useTargetDatabase()

  async function check(targetId: number) {
    const settings = await load()
    if (settings.achievement_alert_enabled !== 1) return

    const target = await show(targetId)
    if (!target) return

    if (target.percentage < 100) return

    const kind = `achievement:${targetId}`
    const lastFired = await getLastFiredAt(kind)
    if (lastFired) return

    await scheduleOneoff(
      'Meta concluída!',
      `Você atingiu 100% da meta "${target.name}". Parabéns!`,
      2,
    )
    await log(kind, { targetId, percentage: target.percentage })
  }

  return { check }
}
