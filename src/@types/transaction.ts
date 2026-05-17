export type TransactionCreate = {
  target_id: number
  amount: number
  observation?: string
  category?: string
  wallet_id?: number
  receipt_uri?: string | null
  occurred_at?: string
}

export type TransactionResponse = {
  id: string
  target_id: number
  wallet_id: number | null
  amount: number
  observation: string
  category: string
  receipt_uri: string | null
  occurredAt: string
  createdAt: string
}

export type Summary = {
  input: number
  output: number
}
