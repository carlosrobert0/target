import { FlatList, StatusBar, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'

import { PageHeader } from '@/components/PageHeader'
import { Loading } from '@/components/Loading'
import { useListAchievements } from '@/hooks/services/achievements/useListAchievements'
import { colors } from '@/theme/colors'

const COLOR_BG: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-400',
  yellow: 'bg-yellow-500',
}

export default function Achievements() {
  const { data, isLoading } = useListAchievements()
  if (isLoading || !data) return <Loading />

  const unlockedCount = data.filter((a) => a.unlocked).length
  const total = data.length

  return (
    <SafeAreaView className="flex-1 px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader
        title="Conquistas"
        subtitle={`${unlockedCount} de ${total} desbloqueadas — cada marco conta.`}
      />

      <FlatList
        data={data}
        keyExtractor={(a) => a.key}
        contentContainerStyle={{ paddingVertical: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View
            className="bg-gray-100 rounded-2xl p-3 flex-row items-center gap-3"
            style={{ opacity: item.unlocked ? 1 : 0.5 }}>
            <View
              className={`${item.unlocked ? COLOR_BG[item.color] : 'bg-gray-300'} w-12 h-12 rounded-full items-center justify-center`}>
              <Feather
                name={(item.unlocked ? item.icon : 'lock') as any}
                size={20}
                color="white"
              />
            </View>
            <View className="flex-1">
              <Text className="font-inter font-bold text-base text-black">{item.title}</Text>
              <Text className="font-inter text-xs text-gray-500">{item.description}</Text>
              {item.unlocked && item.unlockedAt && (
                <Text className="font-inter text-[10px] text-gray-400 mt-0.5">
                  Desbloqueado em {new Date(item.unlockedAt).toLocaleDateString('pt-BR')}
                </Text>
              )}
            </View>
            {item.unlocked && (
              <Feather name="check-circle" size={20} color={colors.green[500]} />
            )}
          </View>
        )}
      />
    </SafeAreaView>
  )
}
