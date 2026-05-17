import type { TransferCreate } from '@/@types/transfer'
import { useTransferDatabase } from '@/database/useTransferDatabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export function useCreateTransfer() {
  const { create } = useTransferDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransferCreate) => create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets-balance'] })
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      Alert.alert('Transferência', 'Transferência registrada com sucesso.', [
        { text: 'Ok', onPress: () => router.back() },
      ])
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível registrar a transferência.')
      console.log(error)
    },
  })
}
