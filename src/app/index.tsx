import { Suspense } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'

import { HomeHeader } from '@/components/HomeHeader'
import { Target } from '@/components/Target'
import { List } from '@/components/List'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { useListTargets } from '@/hooks/services/targets/useFindAllTargets'

export default function Index() {
  const { data } = useListTargets()

  return (
    <Suspense fallback={<Loading />}>
      <View className="size-full">
        <HomeHeader />

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

          <Button title="Nova meta" className="m-6" onPress={() => router.push('/target')} />
        </View>
      </View>
    </Suspense>
  )
}
