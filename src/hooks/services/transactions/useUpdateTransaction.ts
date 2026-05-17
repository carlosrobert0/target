import type { TransactionCreate } from '@/@types/transaction'
import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { useTagDatabase } from '@/database/useTagDatabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

type UpdateInput = {
  id: number
  data: Partial<TransactionCreate>
  tagIds?: number[]
}

export function useUpdateTransaction() {
  const { update, show } = useTransactionDatabase()
  const { setTagsForTransaction } = useTagDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data, tagIds }: UpdateInput) => {
      await update(id, data)
      if (tagIds !== undefined) {
        await setTagsForTransaction(id, tagIds)
      }
      const updated = await show(id)
      return { id, targetId: updated?.target_id ?? null }
    },
    onSuccess: ({ targetId }) => {
      queryClient.invalidateQueries({ queryKey: ['targets'] })
      if (targetId)
        queryClient.invalidateQueries({ queryKey: ['transactions', targetId] })
      else queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summaryTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['search'] })
      queryClient.invalidateQueries({ queryKey: ['wallets-balance'] })
      Alert.alert('Transação', 'Alterações salvas.', [
        { text: 'Ok', onPress: () => router.back() },
      ])
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.')
      console.log(error)
    },
  })
}
