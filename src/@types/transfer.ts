export type Transfer = {
  id: number
  from_wallet_id: number
  to_wallet_id: number
  amount: number
  observation: string | null
  occurred_at: string
  created_at: string
}

export type TransferCreate = {
  from_wallet_id: number
  to_wallet_id: number
  amount: number
  observation?: string
  occurred_at?: string
}

export type TransferWithWallets = Transfer & {
  from_wallet_name: string
  from_wallet_color: string
  to_wallet_name: string
  to_wallet_color: string
}
