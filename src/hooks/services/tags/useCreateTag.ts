import type { TagCreate } from '@/@types/tag'
import { useTagDatabase } from '@/database/useTagDatabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'

export function useCreateTag() {
  const { create } = useTagDatabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TagCreate) => create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
    onError: () => Alert.alert('Erro', 'Não foi possível criar a tag.'),
  })
}
