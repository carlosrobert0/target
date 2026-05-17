import type { Frequency, RecurringResponse } from '@/@types/recurring'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function computeNextRun(
  frequency: Frequency,
  fromTimestampMs: number,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null,
): number {
  const from = new Date(fromTimestampMs)

  switch (frequency) {
    case 'daily':
      return fromTimestampMs + MS_PER_DAY

    case 'weekly': {
      const next = new Date(fromTimestampMs + MS_PER_DAY)
      if (dayOfWeek == null) return next.getTime()
      while (next.getDay() !== dayOfWeek) {
        next.setDate(next.getDate() + 1)
      }
      return next.getTime()
    }

    case 'monthly': {
      const next = new Date(from)
      next.setMonth(next.getMonth() + 1)
      if (dayOfMonth != null) {
        const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
        next.setDate(Math.min(dayOfMonth, lastDayOfMonth))
      }
      return next.getTime()
    }

    case 'yearly': {
      const next = new Date(from)
      next.setFullYear(next.getFullYear() + 1)
      return next.getTime()
    }
  }
}

export function expandPending(
  recurring: Pick<
    RecurringResponse,
    'frequency' | 'next_run' | 'end_date' | 'day_of_month' | 'day_of_week'
  >,
  untilTimestampMs: number,
): number[] {
  const occurrences: number[] = []
  let cursor = new Date(recurring.next_run).getTime()
  const endLimit = recurring.end_date ? new Date(recurring.end_date).getTime() : Infinity

  while (cursor <= untilTimestampMs && cursor <= endLimit) {
    occurrences.push(cursor)
    cursor = computeNextRun(
      recurring.frequency,
      cursor,
      recurring.day_of_month,
      recurring.day_of_week,
    )
    if (occurrences.length > 365) break
  }

  return occurrences
}

export function frequencyLabel(frequency: Frequency): string {
  switch (frequency) {
    case 'daily':
      return 'Diariamente'
    case 'weekly':
      return 'Semanalmente'
    case 'monthly':
      return 'Mensalmente'
    case 'yearly':
      return 'Anualmente'
  }
}

export function formatRelativeDay(timestampMs: number): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(timestampMs)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.round((target.getTime() - now.getTime()) / MS_PER_DAY)

  if (diffDays < 0) return `há ${Math.abs(diffDays)} dia${Math.abs(diffDays) === 1 ? '' : 's'}`
  if (diffDays === 0) return 'hoje'
  if (diffDays === 1) return 'amanhã'
  if (diffDays <= 7) return `em ${diffDays} dias`
  return target.toLocaleDateString('pt-BR')
}
