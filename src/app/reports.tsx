import { PageHeader } from '@/components/PageHeader'
import { StatusBar, View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSummaryByCategory } from '@/hooks/services/transactions/useSummaryByCategory'
import { Loading } from '@/components/Loading'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { PieChart } from 'react-native-gifted-charts'
import { TransactionCategories } from '@/utils/TransactionCategories'

export default function Reports() {
  const { data: categoryData, isLoading } = useSummaryByCategory()

  // Mock data for visualization
  const mockData = [
    { category: TransactionCategories.FOOD, total: 850.5, percentage: 35.2 },
    { category: TransactionCategories.TRANSPORT, total: 420.3, percentage: 17.4 },
    { category: TransactionCategories.LEISURE, total: 380, percentage: 15.7 },
    { category: TransactionCategories.HEALTH, total: 320.8, percentage: 13.3 },
    { category: TransactionCategories.HOUSING, total: 250.4, percentage: 10.4 },
    { category: TransactionCategories.OTHER, total: 190, percentage: 7.9 },
  ]

  // Use real data if available, otherwise use mock data
  const displayData = categoryData && categoryData.length > 0 ? categoryData : mockData

  if (isLoading && (!categoryData || categoryData.length === 0)) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Loading />
      </SafeAreaView>
    )
  }

  const categoryGroups = {
    essentials: {
      name: 'Essenciais',
      percentage: 50,
      color: 'green',
      categories: [
        TransactionCategories.FOOD,
        TransactionCategories.TRANSPORT,
        TransactionCategories.HOUSING,
        TransactionCategories.HEALTH,
      ],
      examples: 'Moradia, alimentação, transporte, saúde',
    },
    wants: {
      name: 'Desejos',
      percentage: 30,
      color: 'yellow',
      categories: [
        TransactionCategories.LEISURE,
        TransactionCategories.ENTERTAINMENT,
        TransactionCategories.CLOTHING,
      ],
      examples: 'Lazer, entretenimento, compras pessoais',
    },
    investments: {
      name: 'Investimentos',
      percentage: 20,
      color: 'blue',
      categories: [
        TransactionCategories.EDUCATION,
        TransactionCategories.TECHNOLOGY,
        TransactionCategories.OTHER,
      ],
      examples: 'Poupança, reserva de emergência, aplicações',
    },
  }

  const totalSpent = displayData.reduce((sum, item) => sum + item.total, 0)

  const recommendations = Object.keys(categoryGroups).reduce(
    (acc, key) => {
      const group = categoryGroups[key as keyof typeof categoryGroups]
      const recommendedValue = totalSpent * (group.percentage / 100)
      const actualValue = displayData
        .filter((item) => group.categories.includes(item.category as TransactionCategories))
        .reduce((sum, item) => sum + item.total, 0)

      acc[key as keyof typeof categoryGroups] = {
        percentage: group.percentage,
        recommendedValue,
        actualValue,
      }
      return acc
    },
    {} as Record<
      keyof typeof categoryGroups,
      { percentage: number; recommendedValue: number; actualValue: number }
    >,
  )

  const pieData = displayData.map((item, index) => ({
    value: item.total,
    text: `${item.percentage.toFixed(1)}%`,
    label: item.category,
    color: getColorByIndex(index),
  }))

  return (
    <SafeAreaView className="size-full bg-back px-6">
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader title="Relatórios" subtitle="Análise dos seus gastos por categoria" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-8">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Gastos</Text>

          <View className="items-center mb-8">
            <PieChart
              data={pieData}
              donut
              showText
              textColor="white"
              radius={120}
              textSize={12}
              focusOnPress
              showValuesAsLabels={false}
            />
          </View>

          <Text className="text-lg font-semibold text-gray-800 mb-4">Análise Financeira</Text>

          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-3">Distribuição Recomendada vs Atual</Text>

            {Object.entries(categoryGroups).map(([key, group]) => {
              const recommendation = recommendations[key as keyof typeof recommendations]
              const colorClasses = {
                green: { bg: 'bg-green-500', text: 'text-green-600' },
                yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600' },
                blue: { bg: 'bg-blue-500', text: 'text-blue-600' },
              }
              const colors = colorClasses[group.color as keyof typeof colorClasses]

              return (
                <View key={key} className="mb-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-sm font-medium text-gray-800">
                      {group.name} ({group.percentage}%)
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {numberToCurrency(recommendation.recommendedValue)}
                    </Text>
                  </View>
                  <View className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <View
                      className={`${colors.bg} h-2 rounded-full`}
                      style={{ width: `${group.percentage}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between">
                    <Text className={`text-xs ${colors.text}`}>Recomendado</Text>
                    <Text className="text-xs text-gray-600">
                      Atual: {numberToCurrency(recommendation.actualValue)}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>

          <Text className="text-lg font-semibold text-gray-800 mb-4">Detalhes por Categoria</Text>

          {displayData.map((item, index) => (
            <View
              key={item.category}
              className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg mb-2">
              <View className="flex-row items-center">
                <View
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: getColorByIndex(index) }}
                />
                <Text className="text-gray-800 font-medium">{item.category}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-800 font-semibold">{numberToCurrency(item.total)}</Text>
                <Text className="text-gray-600 text-sm">{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}

          {(!categoryData || categoryData.length === 0) && (
            <View className="mt-6 p-4 bg-blue-50 rounded-lg">
              <Text className="text-blue-800 text-sm text-center">
                📊 Estes são dados de exemplo.{'\n'}
                Adicione transações com categorias para ver seus dados reais.
              </Text>
            </View>
          )}

          <View className="mt-6 p-4 bg-gray-50 rounded-lg">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              💡 Dicas de Organização Financeira
            </Text>
            <Text className="text-xs text-gray-600 leading-5">
              {Object.entries(categoryGroups).map(([key, group]) => {
                const colorClasses = {
                  green: 'text-green-600',
                  yellow: 'text-yellow-600',
                  blue: 'text-blue-600',
                }
                const colorClass = colorClasses[group.color as keyof typeof colorClasses]

                return (
                  <Text key={key}>
                    •{' '}
                    <Text className={`font-medium ${colorClass}`}>
                      {group.name} ({group.percentage}%):
                    </Text>{' '}
                    {group.examples}
                    {'\n'}
                  </Text>
                )
              })}
              {'\n'}
              <Text className="font-medium">Objetivo:</Text>
              Manter equilíbrio entre necessidades e objetivos financeiros de longo prazo.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
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
