export type Wallet = {
  id: number
  name: string
  icon: string
  color: string
  archived_at: string | null
  created_at: string
}

export type WalletCreate = {
  name: string
  icon?: string
  color?: string
}

export type WalletWithBalance = Wallet & {
  balance: number
  transaction_count: number
}
