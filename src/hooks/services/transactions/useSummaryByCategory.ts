import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import type { TransactionCategories } from '@/utils/TransactionCategories'
import { useQuery } from '@tanstack/react-query'

export interface CategorySummary {
  category: TransactionCategories
  total: number
  percentage: number
}

export function useSummaryByCategory() {
  const { summaryByCategory } = useTransactionDatabase()

  const { data, isLoading, error } = useQuery({
    queryKey: ['summaryByCategory'],
    queryFn: async () => {
      const result = await summaryByCategory()

      if (result.length === 0) return []

      const totalGeral = result.reduce((sum, item) => sum + Math.abs(item.total), 0)

      const formattedData: CategorySummary[] = result.map((item) => ({
        category: item.category as TransactionCategories,
        total: Math.abs(item.total),
        percentage: totalGeral > 0 ? (Math.abs(item.total) / totalGeral) * 100 : 0,
      }))

      return formattedData
    },
  })

  return { data, isLoading, error }
}
