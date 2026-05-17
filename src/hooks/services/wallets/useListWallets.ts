import { useWalletDatabase } from '@/database/useWalletDatabase'
import { useQuery } from '@tanstack/react-query'
import { numberToCurrency } from '@/utils/numberToCurrency'

export function useListWallets() {
  const { list } = useWalletDatabase()
  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => list(),
  })
}

export function useListWalletsWithBalance() {
  const { listWithBalance } = useWalletDatabase()
  return useQuery({
    queryKey: ['wallets-balance'],
    queryFn: async () => {
      const rows = await listWithBalance()
      return rows.map((w) => ({
        ...w,
        balanceLabel: numberToCurrency(w.balance),
      }))
    },
  })
}
