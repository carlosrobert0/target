import React from 'react'
import { ScrollView } from 'react-native'
import { SpendingDistribution } from './SpendingDistribution'
import { FinancialAnalysis } from './FinancialAnalysis'
import { CategoryDetails } from './CategoryDetails'
import { FinancialTips } from './FinancialTips'
import { MockDataWarning } from './MockDataWarning'
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
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <SpendingDistribution data={data} />

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
