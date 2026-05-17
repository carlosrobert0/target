import { useNotificationSettingsDatabase } from '@/database/useNotificationSettingsDatabase'
import { useAnalysisCategoriesDatabase } from '@/database/useAnalysisCategoriesDatabase'
import { useSQLiteContext } from 'expo-sqlite'
import { scheduleOneoff } from '@/lib/notifications'

export function useBudgetWatcher() {
  const database = useSQLiteContext()
  const { load, log, getLastFiredAt } = useNotificationSettingsDatabase()
  const { load: loadAnalysis } = useAnalysisCategoriesDatabase()

  async function check() {
    const settings = await load()
    if (settings.budget_alert_enabled !== 1) return

    const analysis = await loadAnalysis()
    if (!analysis) return

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const rows = await database.getAllAsync<{ category: string; spent: number }>(
      `SELECT category, COALESCE(SUM(ABS(amount)), 0) AS spent
       FROM transactions
       WHERE amount < 0 AND created_at >= ? AND category IS NOT NULL
       GROUP BY category`,
      [monthStart],
    )

    const totalIncome = await database.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM transactions
       WHERE amount > 0 AND created_at >= ?`,
      [monthStart],
    )

    const monthlyBudget = totalIncome?.total ?? 0
    if (monthlyBudget <= 0) return

    for (const [bucketKey, bucket] of Object.entries(analysis)) {
      const allocated = (monthlyBudget * bucket.percentage) / 100
      if (allocated <= 0) continue

      const spent = rows
        .filter((r) => bucket.categories.includes(r.category as any))
        .reduce((sum, r) => sum + r.spent, 0)

      const percentageUsed = (spent / allocated) * 100
      if (percentageUsed < settings.budget_alert_threshold) continue

      const kind = `budget:${monthKey}:${bucketKey}:${settings.budget_alert_threshold}`
      const lastFired = await getLastFiredAt(kind)
      if (lastFired) continue

      await scheduleOneoff(
        `Orçamento de ${bucket.name}`,
        `Você usou ${Math.round(percentageUsed)}% do limite mensal de ${bucket.name.toLowerCase()}.`,
        2,
      )
      await log(kind, { spent, allocated, percentageUsed })
    }
  }

  return { check }
}
