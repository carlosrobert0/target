export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type RecurringCreate = {
  target_id: number
  amount: number
  observation?: string
  category?: string
  frequency: Frequency
  day_of_month?: number
  day_of_week?: number
  start_date: number
  end_date?: number | null
}

export type RecurringResponse = {
  id: number
  target_id: number
  amount: number
  observation: string | null
  category: string | null
  frequency: Frequency
  day_of_month: number | null
  day_of_week: number | null
  start_date: string
  next_run: string
  end_date: string | null
  is_active: number
  last_processed_at: string | null
  created_at: string
  updated_at: string
}

export type RecurringProps = {
  id: string
  targetName: string
  amount: string
  rawAmount: number
  observation: string | null
  category: string | null
  frequency: Frequency
  frequencyLabel: string
  nextRun: string
  nextRunLabel: string
  isActive: boolean
}
