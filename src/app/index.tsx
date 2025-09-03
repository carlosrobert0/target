import { Suspense } from 'react'
import { StatusBar, View } from 'react-native'
import { router } from 'expo-router'

import { HomeHeader } from '@/components/HomeHeader'
import { Target } from '@/components/Target'
import { List } from '@/components/List'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { useListTargets } from '@/hooks/services/targets/useFindAllTargets'
import { useSummaryTransactions } from '@/hooks/services/transactions/useSummaryTransactions'
import { numberToCurrency } from '@/utils/numberToCurrency'

export default function Index() {
  const { data } = useListTargets()
  const { data: summaryData } = useSummaryTransactions()

  const summaryDataFormatted = {
    total: numberToCurrency(summaryData?.total),
    input: {
      label: summaryData?.input.label,
      value: numberToCurrency(summaryData?.input.value),
    },
    output: {
      label: summaryData?.output.label,
      value: numberToCurrency(summaryData?.output.value),
    },
  }

  return (
    <>
      <StatusBar barStyle="light-content" translucent />

      <Suspense fallback={<Loading />}>
        <View className="size-full">
          <HomeHeader data={summaryDataFormatted} />

          <View className="justify-between flex-1">
            <List
              title="Metas"
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Target data={item} onPress={() => router.navigate(`/in-progress/${item.id}`)} />
              )}
              emptyMessage="Você ainda não possui metas criadas."
              containerStyle={{ paddingHorizontal: 24, marginTop: 24 }}
            />

            <View className="px-6 gap-3">
              <Button title="Nova meta" onPress={() => router.push('/target')} />
            </View>
          </View>
        </View>
      </Suspense>
    </>
  )
}
