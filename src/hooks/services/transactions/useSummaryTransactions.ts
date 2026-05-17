import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { useQuery } from '@tanstack/react-query'

export function useSummaryTransactions() {
  const { summary } = useTransactionDatabase()

  const { data, isLoading, error } = useQuery({
    queryKey: ['summaryTransactions'],
    queryFn: async () => {
      const res = await summary()

      return {
        total: res.input + res.output,
        input: {
          label: 'Entradas',
          value: res.input,
        },
        output: {
          label: 'Saídas',
          value: res.output,
        },
      }
    },
  })

  return { data, isLoading, error }
}
