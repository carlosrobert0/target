import type { TargetCreate } from '@/@types/target'
import { useTargetDatabase } from '@/database/useTargetDatabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export function useUpdateTargetById(id: number) {
  const { update } = useTargetDatabase()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: Partial<TargetCreate>) => update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] })
      queryClient.invalidateQueries({ queryKey: ['target', id] })
      Alert.alert('Sucesso', 'Meta atualizada com sucesso!')
      router.push('/')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível atualizar a meta.')
    },
  })

  return mutation
}
