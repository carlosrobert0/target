import type { TargetCreate } from '@/@types/target'
import { useTargetDatabase } from '@/database/useTargetDatabase'
import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'

export function useCreateTarget() {
  const { create } = useTargetDatabase()

  const mutation = useMutation({
    mutationFn: (data: TargetCreate) => create(data),
    onSuccess: () => {
      Alert.alert('Nova Meta', 'Meta criada com sucesso!', [
        {
          text: 'Ok',
          onPress: () => router.back(),
        },
      ])
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível criar a meta.')
      console.log(error)
    },
  })

  return mutation
}
