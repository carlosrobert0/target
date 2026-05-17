import type { TransactionCreate } from '@/@types/transaction'
import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { useTagDatabase } from '@/database/useTagDatabase'
import { useAchievementWatcher } from '@/hooks/services/notifications/useAchievementWatcher'
import { useBudgetWatcher } from '@/hooks/services/notifications/useBudgetWatcher'
import { useAchievementsWatcher } from '@/hooks/services/achievements/useAchievementsWatcher'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export type TransactionCreateWithTags = TransactionCreate & { tagIds?: number[] }

export function useCreateTransaction() {
  const { create } = useTransactionDatabase()
  const { setTagsForTransaction } = useTagDatabase()
  const { check: checkAchievement } = useAchievementWatcher()
  const { check: checkBudget } = useBudgetWatcher()
  const { onTransactionCreated } = useAchievementsWatcher()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: TransactionCreateWithTags) => {
      const { tagIds, ...txData } = data
      const newId = await create(txData)
      if (tagIds && tagIds.length > 0) {
        await setTagsForTransaction(newId, tagIds)
      }
      return { newId, targetId: txData.target_id, amount: txData.amount }
    },
    onSuccess: async ({ targetId, amount }) => {
      queryClient.invalidateQueries({ queryKey: ['targets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions', targetId] })
      queryClient.invalidateQueries({ queryKey: ['summaryTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['search'] })
      queryClient.invalidateQueries({ queryKey: ['wallets-balance'] })

      try {
        await checkAchievement(targetId)
        if (amount < 0) await checkBudget()
        await onTransactionCreated(targetId)
      } catch (e) {
        console.log('Watcher error:', e)
      }

      Alert.alert('Nova Transação', 'Transação criada com sucesso!', [
        { text: 'Ok', onPress: () => router.back() },
      ])
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível criar a transação.')
      console.log(error)
    },
  })

  return mutation
}
