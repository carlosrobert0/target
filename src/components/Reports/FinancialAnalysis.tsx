import { View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { CategoryGroup, RecommendationData } from './types'

interface FinancialAnalysisProps {
  categoryGroups: Record<string, CategoryGroup>
  recommendations: Record<string, RecommendationData>
  totalSpent: number
  onSettingsPress: () => void
}

export function FinancialAnalysis({
  categoryGroups,
  recommendations,
  totalSpent,
  onSettingsPress,
}: FinancialAnalysisProps) {
  return (
    <>
      <View className="flex-row justify-between items-center mt-6 mb-3">
        <Text className="text-lg font-semibold text-gray-800">Análise Financeira</Text>
        <TouchableOpacity onPress={onSettingsPress} className="p-2">
          <Feather name="settings" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View className="bg-white p-4 rounded-xl shadow">
        <Text className="text-sm text-gray-600 mb-4">Distribuição Recomendada vs Atual</Text>

        {Object.entries(categoryGroups).map(([key, group]) => {
          const recommendation = recommendations[key as keyof typeof recommendations]
          const colorClasses = {
            green: { bg: 'bg-green-500', text: 'text-green-600' },
            yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600' },
            blue: { bg: 'bg-blue-500', text: 'text-blue-600' },
          }
          const colors = colorClasses[group.color as keyof typeof colorClasses]

          const actualPercentage = Math.min(100, (recommendation.actualValue / totalSpent) * 100)

          return (
            <View key={key} className="mb-4">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-medium text-gray-800">
                  {group.name} ({group.percentage}%)
                </Text>
                <Text className="text-base text-gray-600">
                  {numberToCurrency(recommendation.recommendedValue)}
                </Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-3 mb-1 relative">
                <View
                  className={`${colors.bg} h-3 rounded-full`}
                  style={{ width: `${actualPercentage}%` }}
                />
                <View
                  className="absolute top-0 h-3 border-l-2 border-dashed border-gray-600"
                  style={{ left: `${group.percentage}%` }}
                />
              </View>
              <View className="flex-row justify-between">
                <Text className={`text-sm ${colors.text}`}>Recomendado: {group.percentage}%</Text>
                <Text className="text-sm text-gray-600">
                  Atual: {actualPercentage.toFixed(1)}% (
                  {numberToCurrency(recommendation.actualValue)})
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </>
  )
}
