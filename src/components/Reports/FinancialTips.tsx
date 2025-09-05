import { View, Text } from 'react-native'
import { CategoryGroup } from './types'

interface FinancialTipsProps {
  categoryGroups: Record<string, CategoryGroup>
}

export function FinancialTips({ categoryGroups }: FinancialTipsProps) {
  const colorMap: Record<string, string> = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
  }
  const groups = Object.values(categoryGroups || {})

  return (
    <>
      <Text className="text-lg font-semibold text-gray-800 mt-3 mb-3">Dicas Financeiras</Text>
      <View className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        {groups.length === 0 && (
          <Text className="text-sm text-gray-600">Nenhum grupo configurado.</Text>
        )}

        {groups.map((group) => (
          <View key={group.name} className="mb-3">
            <Text className={`text-base font-semibold ${colorMap[group.color] || 'text-gray-800'}`}>
              {group.name} - {group.percentage}%
            </Text>

            <Text className="text-sm text-gray-600 mt-1">{group.categories.join(', ')}</Text>
          </View>
        ))}
      </View>
    </>
  )
}
