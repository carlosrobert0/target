import { useRecurringTransactionDatabase } from '@/database/useRecurringTransactionDatabase'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { frequencyLabel, formatRelativeDay } from '@/utils/recurrence'
import { useQuery } from '@tanstack/react-query'
import type { RecurringProps } from '@/@types/recurring'

export function useListRecurring() {
  const { list } = useRecurringTransactionDatabase()

  return useQuery({
    queryKey: ['recurring'],
    queryFn: async (): Promise<RecurringProps[]> => {
      const rows = await list()
      return rows.map((row) => ({
        id: String(row.id),
        targetName: row.target_name,
        amount: numberToCurrency(row.amount),
        rawAmount: row.amount,
        observation: row.observation,
        category: row.category,
        frequency: row.frequency,
        frequencyLabel: frequencyLabel(row.frequency),
        nextRun: row.next_run,
        nextRunLabel: formatRelativeDay(new Date(row.next_run).getTime()),
        isActive: row.is_active === 1,
      }))
    },
  })
}
