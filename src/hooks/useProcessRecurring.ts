import { useEffect, useRef } from 'react'
import { useRecurringTransactionDatabase } from '@/database/useRecurringTransactionDatabase'
import { computeNextRun, expandPending } from '@/utils/recurrence'
import { useQueryClient } from '@tanstack/react-query'

export function useProcessRecurring() {
  const { listDue, processOne } = useRecurringTransactionDatabase()
  const queryClient = useQueryClient()
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const run = async () => {
      try {
        const now = Date.now()
        const due = await listDue(now)
        if (due.length === 0) return

        let totalInserted = 0
        for (const rec of due) {
          const occurrences = expandPending(rec, now)
          if (occurrences.length === 0) continue
          const lastOccurrence = occurrences[occurrences.length - 1]
          const nextAfterLast = computeNextRun(
            rec.frequency,
            lastOccurrence,
            rec.day_of_month,
            rec.day_of_week,
          )
          await processOne(rec, occurrences, nextAfterLast)
          totalInserted += occurrences.length
        }

        if (totalInserted > 0) {
          queryClient.invalidateQueries({ queryKey: ['targets'] })
          queryClient.invalidateQueries({ queryKey: ['transactions'] })
          queryClient.invalidateQueries({ queryKey: ['summary'] })
          queryClient.invalidateQueries({ queryKey: ['recurring'] })
        }
      } catch (error) {
        console.log('Erro ao processar recorrências:', error)
      }
    }

    run()
  }, [])
}
