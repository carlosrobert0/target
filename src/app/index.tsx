import { View, StatusBar } from 'react-native'
import { router } from 'expo-router'

import { HomeHeader } from '@/components/HomeHeader'
import { Target, type TargetProps } from '@/components/Target'
import { List } from '@/components/List'
import { Button } from '@/components/Button'

export default function Index() {
  const targets: TargetProps[] = [
    {
      id: '1',
      name: 'Apple Watch',
      percentage: '50%',
      current: '580,00',
      target: '1.790,00',
    },
    {
      id: '2',
      name: 'Comprar uma cadeira ergonômica',
      percentage: '75%',
      current: '900,00',
      target: '1.200,00',
    },
    {
      id: '3',
      name: 'Fazer uma viagem para o Rio de Janeiro',
      percentage: '50%',
      current: '1.500,00',
      target: '3.000,00',
    },
  ]

  return (
    <View className="size-full">
      <StatusBar barStyle="light-content" />
      <HomeHeader />

      <View className="justify-between flex-1">
        <List
          title="Metas"
          data={targets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Target data={item} onPress={() => router.navigate(`/in-progress/${item.id}`)} />
          )}
          emptyMessage="Você ainda não possui metas criadas."
          containerStyle={{ paddingHorizontal: 24, marginTop: 24 }}
        />

        <Button title="Nova meta" className="m-6" />
      </View>
    </View>
  )
}
