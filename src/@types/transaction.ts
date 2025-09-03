export type TransactionCreate = {
  target_id: number
  amount: number
  observation?: string
  category?: string
}

export type TransactionResponse = {
  id: string
  target_id: number
  amount: number
  observation: string
  category: string
  createdAt: string
}

export type Summary = {
  input: number
  output: number
}
