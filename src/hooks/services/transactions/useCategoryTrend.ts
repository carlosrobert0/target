import { useSQLiteContext } from 'expo-sqlite'
import { useQuery } from '@tanstack/react-query'

export type CategoryTrendRow = {
  category: string
  currentMonth: number
  threeMonthAverage: number
  deltaPercent: number
}

export function useCategoryTrend() {
  const database = useSQLiteContext()

  return useQuery({
    queryKey: ['category-trend'],
    queryFn: async (): Promise<CategoryTrendRow[]> => {
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const threeMonthStart = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString()

      const currentRows = await database.getAllAsync<{ category: string; total: number }>(
        `SELECT COALESCE(category, 'Sem categoria') AS category, SUM(ABS(amount)) AS total
         FROM transactions
         WHERE amount < 0 AND occurred_at >= ?
         GROUP BY category`,
        [currentMonthStart],
      )

      const pastRows = await database.getAllAsync<{ category: string; total: number }>(
        `SELECT COALESCE(category, 'Sem categoria') AS category, SUM(ABS(amount)) AS total
         FROM transactions
         WHERE amount < 0
           AND occurred_at >= ?
           AND occurred_at < ?
         GROUP BY category`,
        [threeMonthStart, currentMonthStart],
      )

      const currentMap = new Map(currentRows.map((r) => [r.category, r.total]))
      const pastMap = new Map(pastRows.map((r) => [r.category, r.total / 3]))
      const allCategories = new Set([...currentMap.keys(), ...pastMap.keys()])

      const result: CategoryTrendRow[] = []
      for (const category of allCategories) {
        const currentMonth = currentMap.get(category) ?? 0
        const threeMonthAverage = pastMap.get(category) ?? 0
        const deltaPercent =
          threeMonthAverage > 0
            ? ((currentMonth - threeMonthAverage) / threeMonthAverage) * 100
            : currentMonth > 0
              ? 100
              : 0
        result.push({ category, currentMonth, threeMonthAverage, deltaPercent })
      }

      return result.sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent))
    },
  })
}
