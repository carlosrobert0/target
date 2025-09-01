import { useTargetDatabase } from '@/database/useTargetDatabase'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export function useUpdateTargetById(id: number) {
  const { update } = useTargetDatabase()

  const mutation = useMutation({
    mutationFn: (data: any) => update(id, data),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Meta atualizada com sucesso!')
      router.push('/')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível atualizar a meta.')
    },
  })

  return mutation
}
