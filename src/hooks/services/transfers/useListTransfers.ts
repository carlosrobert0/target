import { useTransferDatabase } from '@/database/useTransferDatabase'
import { useQuery } from '@tanstack/react-query'
import { numberToCurrency } from '@/utils/numberToCurrency'

export function useListTransfers() {
  const { list } = useTransferDatabase()
  return useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const rows = await list()
      return rows.map((t) => ({
        ...t,
        amountLabel: numberToCurrency(t.amount),
        dateLabel: new Date(t.occurred_at).toLocaleDateString('pt-BR'),
      }))
    },
  })
}
