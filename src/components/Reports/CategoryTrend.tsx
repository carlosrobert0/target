import { Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { CategoryTrendRow } from '@/hooks/services/transactions/useCategoryTrend'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { colors } from '@/theme/colors'

type Props = {
  data: CategoryTrendRow[]
}

export function CategoryTrend({ data }: Props) {
  if (data.length === 0) return null

  const top = data.slice(0, 5)

  return (
    <View className="bg-gray-100 rounded-2xl p-4 gap-3">
      <Text className="font-inter font-bold text-base text-black">Variação por categoria</Text>
      <Text className="font-inter text-xs text-gray-500">Mês atual vs. média dos 3 meses anteriores.</Text>

      <View className="gap-2 mt-1">
        {top.map((row) => {
          const isUp = row.deltaPercent > 0
          const color = isUp ? colors.red[400] : colors.green[500]
          return (
            <View key={row.category} className="flex-row justify-between items-center">
              <View className="flex-1 pr-2">
                <Text className="font-inter text-sm text-black">{row.category}</Text>
                <Text className="font-inter text-xs text-gray-500">
                  Atual: {numberToCurrency(row.currentMonth)} · média:{' '}
                  {numberToCurrency(row.threeMonthAverage)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Feather
                  name={isUp ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={color}
                />
                <Text className="font-inter text-sm font-bold" style={{ color }}>
                  {isUp ? '+' : ''}
                  {Math.round(row.deltaPercent)}%
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
