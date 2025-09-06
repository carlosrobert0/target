import { StatusBar } from 'react-native'
import { PageHeader } from '@/components/PageHeader'
import { Loading } from '@/components/Loading'
import { useSummaryByCategory } from '@/hooks/services/transactions/useSummaryByCategory'
import { TransactionCategories } from '@/utils/TransactionCategories'
import { Reports } from '@/components/Reports'
import { Modals } from '@/components/Reports/Modals'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AnalysisConfigProvider, useAnalysisConfig } from '@/contexts/AnalysisConfigContext'

function ReportsContent() {
  const { data: categoryData, isLoading } = useSummaryByCategory()
  const {
    categories,
    isLoading: isCategoriesLoading,
    updateCategoryField,
    saveConfigurations,
    toggleCategory,
    isCategorySelected,
    isCategoryUsedElsewhere,
    editingGroup,
    setEditingGroup,
    isConfigModalVisible,
    setIsConfigModalVisible,
    isCategoriesModalVisible,
    setIsCategoriesModalVisible,
  } = useAnalysisConfig()

  const mockData = [
    { category: TransactionCategories.FOOD, total: 850.5, percentage: 35.2 },
    { category: TransactionCategories.TRANSPORT, total: 420.3, percentage: 17.4 },
    { category: TransactionCategories.LEISURE, total: 380, percentage: 15.7 },
    { category: TransactionCategories.HEALTH, total: 320.8, percentage: 13.3 },
    { category: TransactionCategories.HOUSING, total: 250.4, percentage: 10.4 },
    { category: TransactionCategories.OTHER, total: 190, percentage: 7.9 },
  ]

  const displayData = categoryData && categoryData.length > 0 ? categoryData : mockData

  if (isLoading && (!categoryData || categoryData.length === 0)) {
    return (
      <SafeAreaView className="size-full bg-white justify-center items-center">
        <Loading />
      </SafeAreaView>
    )
  }

  if (isCategoriesLoading || !categories) {
    return (
      <SafeAreaView className="size-full bg-white justify-center items-center">
        <Loading />
      </SafeAreaView>
    )
  }

  const categoryGroups = categories

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

  const openCategoriesModal = (groupKey: string) => {
    setEditingGroup(groupKey)
    setIsCategoriesModalVisible(true)
  }

  const closeCategoriesModal = () => {
    setIsCategoriesModalVisible(false)
    setEditingGroup(null)
  }

  return (
    <SafeAreaView className="size-full px-6 bg-background">
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader title="Relatórios" subtitle="Análise dos seus gastos por categoria" />

      <Reports
        data={displayData}
        categoryGroups={categoryGroups}
        recommendations={recommendations}
        totalSpent={totalSpent}
        hasRealData={!!(categoryData && categoryData.length > 0)}
        onSettingsPress={() => setIsConfigModalVisible(true)}
      />

      <Modals.Configuration
        visible={isConfigModalVisible}
        categories={categories}
        onClose={() => setIsConfigModalVisible(false)}
        onUpdateCategory={updateCategoryField}
        onSave={saveConfigurations}
        onOpenCategoriesModal={openCategoriesModal}
      />

      <Modals.Categories
        visible={isCategoriesModalVisible}
        editingGroup={editingGroup}
        categories={categories}
        onClose={closeCategoriesModal}
        onToggleCategory={toggleCategory}
        isCategorySelected={isCategorySelected}
        isCategoryUsedElsewhere={isCategoryUsedElsewhere}
      />
    </SafeAreaView>
  )
}

export default function ReportsPage() {
  return (
    <AnalysisConfigProvider>
      <ReportsContent />
    </AnalysisConfigProvider>
  )
}
