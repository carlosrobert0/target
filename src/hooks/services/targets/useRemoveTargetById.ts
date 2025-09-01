import { useTargetDatabase } from '@/database/useTargetDatabase'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export function useRemoveTargetById(id: number) {
  const { remove } = useTargetDatabase()

  const mutation = useMutation({
    mutationFn: () => remove(id),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Meta removida com sucesso!')
      router.push('/')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível remover a meta.')
    },
  })

  return mutation
}
