import { useAchievementsDatabase } from '@/database/useAchievementsDatabase'
import { useTargetDatabase } from '@/database/useTargetDatabase'
import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { useRecurringTransactionDatabase } from '@/database/useRecurringTransactionDatabase'
import { useQueryClient } from '@tanstack/react-query'
import { ACHIEVEMENTS, type AchievementKey } from '@/utils/achievements'
import { scheduleOneoff } from '@/lib/notifications'

export function useAchievementsWatcher() {
  const { unlock } = useAchievementsDatabase()
  const { show } = useTargetDatabase()
  const { countAll } = useTransactionDatabase()
  const { list: listRecurring } = useRecurringTransactionDatabase()
  const queryClient = useQueryClient()

  async function maybeUnlock(key: AchievementKey) {
    const inserted = await unlock(key)
    if (!inserted) return
    queryClient.invalidateQueries({ queryKey: ['achievements'] })
    const def = ACHIEVEMENTS[key]
    try {
      await scheduleOneoff('Conquista desbloqueada!', def.title, 2)
    } catch (e) {
      console.log('[achievement] notif error', e)
    }
  }

  async function onTargetCreated(totalTargets: number) {
    if (totalTargets >= 1) await maybeUnlock('first_target')
    if (totalTargets >= 3) await maybeUnlock('three_targets')
  }

  async function onTransactionCreated(targetId: number) {
    const total = await countAll()
    if (total >= 1) await maybeUnlock('first_transaction')
    if (total >= 10) await maybeUnlock('ten_transactions')
    if (total >= 50) await maybeUnlock('fifty_transactions')

    const target = await show(targetId)
    if (target && target.percentage >= 100) {
      await maybeUnlock('target_completed')
    }
  }

  async function onRecurringCreated() {
    const recurrences = await listRecurring()
    if (recurrences.length >= 1) await maybeUnlock('first_recurring')
  }

  return { onTargetCreated, onTransactionCreated, onRecurringCreated, maybeUnlock }
}
