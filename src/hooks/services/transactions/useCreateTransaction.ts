import type { TransactionCreate } from '@/@types/transaction'
import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export function useCreateTransaction() {
  const { create } = useTransactionDatabase()

  const mutation = useMutation({
    mutationFn: (data: TransactionCreate) => create(data),
    onSuccess: () => {
      Alert.alert('Nova Transação', 'Transação criada com sucesso!', [
        {
          text: 'Ok',
          onPress: () => router.back(),
        },
      ])
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível criar a transação.')
      console.log(error)
    },
  })

  return mutation
}
