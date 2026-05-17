import { Text, View } from 'react-native'
import { BarChart } from 'react-native-gifted-charts'
import type { MonthlyHistoryPoint } from '@/hooks/services/transactions/useMonthlyHistory'
import { numberToCurrency } from '@/utils/numberToCurrency'

type Props = {
  data: MonthlyHistoryPoint[]
}

export function MonthlyChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <View className="bg-gray-100 rounded-2xl p-4">
        <Text className="font-inter text-sm text-gray-500">Sem dados nos últimos meses.</Text>
      </View>
    )
  }

  const chartData = data.flatMap((point) => [
    {
      value: point.income,
      label: point.monthLabel,
      frontColor: '#4AE124',
      spacing: 2,
    },
    {
      value: point.expense,
      frontColor: '#FF6767',
      spacing: 12,
    },
  ])

  const latest = data[data.length - 1]

  return (
    <View className="bg-gray-100 rounded-2xl p-4 gap-3">
      <View className="flex-row justify-between items-center">
        <Text className="font-inter font-bold text-base text-black">Últimos 12 meses</Text>
        <Text className="font-inter text-xs text-gray-500">
          Saldo: {numberToCurrency(latest.cumulative)}
        </Text>
      </View>

      <BarChart
        data={chartData}
        barWidth={10}
        height={140}
        noOfSections={3}
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        xAxisLabelTextStyle={{ color: '#6F6F6F', fontSize: 10 }}
        yAxisTextStyle={{ color: '#6F6F6F', fontSize: 10 }}
        isAnimated
      />

      <View className="flex-row gap-4">
        <Legend color="#4AE124" label="Entradas" />
        <Legend color="#FF6767" label="Saídas" />
      </View>
    </View>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      <Text className="font-inter text-xs text-gray-500">{label}</Text>
    </View>
  )
}
