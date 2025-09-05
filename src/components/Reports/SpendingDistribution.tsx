import { View, Text } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'

interface CategoryData {
  category: string
  total: number
  percentage: number
}

interface SpendingDistributionProps {
  data: CategoryData[]
}

function getColorByIndex(index: number): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
    '#F8C471',
    '#82E0AA',
  ]
  return colors[index % colors.length]
}

export function SpendingDistribution({ data }: SpendingDistributionProps) {
  const pieData = data.map((item, index) => ({
    value: item.total,
    text: `${item.percentage.toFixed(1)}%`,
    label: item.category,
    color: getColorByIndex(index),
  }))

  return (
    <>
      <Text className="text-lg font-semibold text-gray-800 mt-6 mb-3">Distribuição de Gastos</Text>
      <View className="items-center bg-white p-4 rounded-xl shadow">
        <PieChart
          data={pieData}
          donut
          showText
          textColor="white"
          radius={120}
          textSize={14}
          focusOnPress
          innerCircleColor="#f9fafb"
        />
        <View className="mt-4 flex-wrap flex-row justify-center">
          {data.map((item, index) => (
            <View key={item.category} className="flex-row items-center m-1">
              <View
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: getColorByIndex(index) }}
              />
              <Text className="text-gray-700 text-base">{item.category}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  )
}
