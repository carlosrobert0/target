import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { formatDate } from '@/utils/formatDate'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { useQuery } from '@tanstack/react-query'

export function useListTransactionsByTargetId(id: number) {
  const { listTransactionsByTargetId } = useTransactionDatabase()

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const res = await listTransactionsByTargetId(id)
      return res.map((item) => ({
        id: item.id,
        value: numberToCurrency(item.amount),
        date: formatDate(item.createdAt),
        description: item.observation,
        type: item.amount > 0 ? TransactionTypes.Input : TransactionTypes.Output,
        category: item.category,
      }))
    },
    enabled: !!id,
  })

  return { data, isLoading, error }
}
