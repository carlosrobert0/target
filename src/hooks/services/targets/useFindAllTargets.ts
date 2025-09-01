import { useTargetDatabase } from '@/database/useTargetDatabase'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { useQuery } from '@tanstack/react-query'
import { Alert } from 'react-native'

export function useListTargets() {
  const { listBySavedValue } = useTargetDatabase()

  async function fetchTargets() {
    try {
      const response = await listBySavedValue()

      if (!response) {
        return null
      }

      const targetsFormatted = response.map(({ id, amount, name, current, percentage }) => ({
        id: String(id),
        name,
        current: numberToCurrency(current),
        percentage: percentage.toFixed(0) + '%',
        target: numberToCurrency(amount),
      }))

      return targetsFormatted
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as metas.')
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['targets'],
    queryFn: fetchTargets,
  })

  return {
    data,
    isLoading,
    error,
  }
}
