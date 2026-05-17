import { useTargetDatabase } from '@/database/useTargetDatabase'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { deadlineInfo } from '@/utils/targetMath'
import { useQuery } from '@tanstack/react-query'
import { Alert } from 'react-native'

export function useListTargets() {
  const { listByClosestTarget } = useTargetDatabase()

  async function fetchTargets() {
    try {
      const response = await listByClosestTarget()
      if (!response) return null

      return response.map(({ id, amount, name, current, percentage, target_date }) => {
        const info = deadlineInfo(target_date, current, amount)
        return {
          id: String(id),
          name,
          current: numberToCurrency(current),
          percentage: percentage.toFixed(0) + '%',
          target: numberToCurrency(amount),
          deadline: info?.deadlineLabel,
          monthlyContribution: info && percentage < 100 ? info.monthlyContributionLabel : undefined,
        }
      })
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as metas.')
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['targets'],
    queryFn: fetchTargets,
  })

  return { data, isLoading, error }
}
