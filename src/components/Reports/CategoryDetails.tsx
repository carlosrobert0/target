import { View, Text } from 'react-native'
import { numberToCurrency } from '@/utils/numberToCurrency'

interface CategoryData {
  category: string
  total: number
  percentage: number
}

interface CategoryDetailsProps {
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

export function CategoryDetails({ data }: CategoryDetailsProps) {
  return (
    <>
      <Text className="text-lg font-semibold text-gray-800 mt-6 mb-3">Detalhes por Categoria</Text>
      {data.map((item, index) => (
        <View
          key={item.category}
          className="flex-row items-center justify-between p-4 bg-white rounded-xl mb-3 shadow-sm">
          <View className="flex-row items-center">
            <View
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: getColorByIndex(index) }}
            />
            <Text className="text-gray-800 font-medium text-base">{item.category}</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-800 font-semibold">{numberToCurrency(item.total)}</Text>
            <Text className="text-gray-600 text-sm">{item.percentage.toFixed(1)}%</Text>
          </View>
        </View>
      ))}
    </>
  )
}
