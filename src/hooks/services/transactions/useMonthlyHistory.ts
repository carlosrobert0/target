import { useSQLiteContext } from 'expo-sqlite'
import { useQuery } from '@tanstack/react-query'

export type MonthlyHistoryPoint = {
  monthKey: string
  monthLabel: string
  income: number
  expense: number
  net: number
  cumulative: number
}

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function useMonthlyHistory(monthsBack = 12) {
  const database = useSQLiteContext()

  return useQuery({
    queryKey: ['monthly-history', monthsBack],
    queryFn: async (): Promise<MonthlyHistoryPoint[]> => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1).toISOString()

      const rows = await database.getAllAsync<{
        month_key: string
        income: number
        expense: number
      }>(
        `SELECT
           strftime('%Y-%m', occurred_at) AS month_key,
           COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS income,
           COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS expense
         FROM transactions
         WHERE occurred_at >= ?
         GROUP BY month_key
         ORDER BY month_key ASC`,
        [start],
      )

      const byKey = new Map(rows.map((r) => [r.month_key, r]))

      const points: MonthlyHistoryPoint[] = []
      let cumulative = 0
      for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const row = byKey.get(monthKey)
        const income = row?.income ?? 0
        const expense = row?.expense ?? 0
        const net = income + expense
        cumulative += net
        points.push({
          monthKey,
          monthLabel: MONTH_SHORT[d.getMonth()],
          income,
          expense: Math.abs(expense),
          net,
          cumulative,
        })
      }

      return points
    },
  })
}
