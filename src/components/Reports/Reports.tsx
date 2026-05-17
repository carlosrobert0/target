import React from 'react'
import { ScrollView, View } from 'react-native'
import { SpendingDistribution } from './SpendingDistribution'
import { FinancialAnalysis } from './FinancialAnalysis'
import { CategoryDetails } from './CategoryDetails'
import { FinancialTips } from './FinancialTips'
import { MockDataWarning } from './MockDataWarning'
import { MonthlyChart } from './MonthlyChart'
import { CategoryTrend } from './CategoryTrend'
import { useMonthlyHistory } from '@/hooks/services/transactions/useMonthlyHistory'
import { useCategoryTrend } from '@/hooks/services/transactions/useCategoryTrend'
import { CategoryData, CategoryGroup, RecommendationData } from './types'

interface ReportsProps {
  children?: React.ReactNode
  data: CategoryData[]
  categoryGroups: Record<string, CategoryGroup>
  recommendations: Record<string, RecommendationData>
  totalSpent: number
  hasRealData: boolean
  onSettingsPress: () => void
}

export function Reports({
  data,
  categoryGroups,
  recommendations,
  totalSpent,
  hasRealData,
  onSettingsPress,
}: ReportsProps) {
  const { data: monthly } = useMonthlyHistory(12)
  const { data: trend } = useCategoryTrend()

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SpendingDistribution data={data} />

      {monthly && (
        <View style={{ marginTop: 16 }}>
          <MonthlyChart data={monthly} />
        </View>
      )}

      {trend && trend.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <CategoryTrend data={trend} />
        </View>
      )}

      <FinancialAnalysis
        categoryGroups={categoryGroups}
        recommendations={recommendations}
        totalSpent={totalSpent}
        onSettingsPress={onSettingsPress}
      />

      <CategoryDetails data={data} />

      <MockDataWarning hasRealData={hasRealData} />

      <FinancialTips categoryGroups={categoryGroups} />
    </ScrollView>
  )
}
