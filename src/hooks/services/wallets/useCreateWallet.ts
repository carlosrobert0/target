import type { WalletCreate } from '@/@types/wallet'
import { useWalletDatabase } from '@/database/useWalletDatabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'

export function useCreateWallet() {
  const { create } = useWalletDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: WalletCreate) => create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallets-balance'] })
    },
    onError: () => Alert.alert('Erro', 'Não foi possível criar a carteira.'),
  })
}

export function useUpdateWallet() {
  const { update } = useWalletDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WalletCreate> }) => update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallets-balance'] })
    },
  })
}

export function useArchiveWallet() {
  const { archive } = useWalletDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallets-balance'] })
    },
  })
}
