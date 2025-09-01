export type TransactionCreate = {
  target_id: number
  amount: number
  observation?: string
}

export type TransactionResponse = {
  id: string
  target_id: number
  amount: number
  observation: string
  createdAt: string
}
