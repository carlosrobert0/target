export type TargetProps = {
  id?: string
  name: string
  percentage: string
  current: string
  target: string
}

export type TargetCreate = {
  name: string
  amount: number
}

export type TargetResponse = {
  id: number
  name: string
  amount: number
  current: number
  percentage: number
  created_at: Date
  updated_at: Date
}
