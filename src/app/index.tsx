import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native'

import { Separator } from '@/components/Separator'

import chevronRight from '@/assets/icons/chevron-right.png'
import { HomeHeader } from '@/components/HomeHeader'
import { Link } from 'expo-router'
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
    <View className="w-full h-full">
      <HomeHeader />

      <View className="justify-between flex-1">
        <List
          title="Metas"
          data={targets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Target data={item} />}
          emptyMessage="Você ainda não possui metas criadas."
          containerStyle={{ paddingHorizontal: 24, marginTop: 24 }}
        />

        <Button title="Nova meta" />
      </View>
    </View>
  )
}
