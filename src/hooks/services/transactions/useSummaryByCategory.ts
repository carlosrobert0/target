import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { useQuery } from '@tanstack/react-query'

export interface CategorySummary {
  category: string
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

      // Calcular o total geral para percentuais
      const totalGeral = result.reduce((sum, item) => sum + Math.abs(item.total), 0)

      // Converter para formato do gráfico e calcular percentuais
      const formattedData: CategorySummary[] = result.map((item) => ({
        category: item.category,
        total: Math.abs(item.total), // Valor absoluto para exibição
        percentage: totalGeral > 0 ? (Math.abs(item.total) / totalGeral) * 100 : 0,
      }))

      return formattedData
    },
  })

  return { data, isLoading, error }
}
