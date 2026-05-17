export type TargetProps = {
  id?: string
  name: string
  percentage: string
  current: string
  target: string
  deadline?: string
  monthlyContribution?: string
}

export type TargetCreate = {
  name: string
  amount: number
  target_date?: string | null
}

export type TargetResponse = {
  id: number
  name: string
  amount: number
  current: number
  percentage: number
  target_date: string | null
  created_at: Date
  updated_at: Date
}
