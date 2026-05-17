import { router } from 'expo-router'
import { Alert, FlatList, StatusBar, Text, TouchableOpacity, View, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { useListRecurring } from '@/hooks/services/recurring/useListRecurring'
import { useToggleRecurring } from '@/hooks/services/recurring/useToggleRecurring'
import { useRemoveRecurring } from '@/hooks/services/recurring/useRemoveRecurring'
import { colors } from '@/theme/colors'

export default function RecurringList() {
  const { data, isLoading } = useListRecurring()
  const { mutate: toggle } = useToggleRecurring()
  const { mutate: remove } = useRemoveRecurring()

  if (isLoading) return <Loading />

  function handleRemove(id: number) {
    Alert.alert('Remover recorrência', 'Os lançamentos já criados serão mantidos.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remove(id) },
    ])
  }

  return (
    <SafeAreaView className="flex-1 px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader
        title="Recorrências"
        subtitle="Salário, assinaturas, aluguel — lançados automaticamente."
      />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="font-inter text-gray-500 text-center mt-12">
            Nenhuma recorrência cadastrada.
          </Text>
        }
        contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
        renderItem={({ item }) => {
          const isIncome = item.rawAmount > 0
          return (
            <View className="bg-gray-100 rounded-2xl p-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-2">
                  <Text className="font-inter font-bold text-base text-black">
                    {item.targetName}
                  </Text>
                  {item.observation && (
                    <Text className="font-inter text-xs text-gray-500 mt-1" numberOfLines={1}>
                      {item.observation}
                    </Text>
                  )}
                  <Text className="font-inter text-xs text-gray-500 mt-1">
                    {item.frequencyLabel} · próximo: {item.nextRunLabel}
                  </Text>
                </View>

                <View className="items-end gap-2">
                  <Text
                    className={`font-inter font-bold text-base ${
                      isIncome ? 'text-green-600' : 'text-red-500'
                    }`}>
                    {item.amount}
                  </Text>
                  <Switch
                    value={item.isActive}
                    onValueChange={(v) => toggle({ id: Number(item.id), isActive: v })}
                  />
                </View>
              </View>

              <View className="flex-row gap-3 mt-3">
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => router.push(`/recurring/${item.id}`)}>
                  <Feather name="edit-2" size={14} color={colors.gray[600]} />
                  <Text className="font-inter text-xs text-gray-600">Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => handleRemove(Number(item.id))}>
                  <Feather name="trash-2" size={14} color={colors.red[400]} />
                  <Text className="font-inter text-xs text-red-400">Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />

      <View className="pb-4">
        <Button title="Nova recorrência" onPress={() => router.push('/recurring/new')} />
      </View>
    </SafeAreaView>
  )
}
