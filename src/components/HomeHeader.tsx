import { colors } from '@/theme/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { Separator } from './Separator'
import { View, Text, TouchableOpacity } from 'react-native'
import { Summary, type SummaryProps } from './Summary'
import { AntDesign, Feather } from '@expo/vector-icons'
import { router } from 'expo-router'

export type HomeHeaderProps = {
  total: string
  input: SummaryProps
  output: SummaryProps
}

type Props = {
  data: HomeHeaderProps
}

export function HomeHeader({ data }: Props) {
  return (
    <LinearGradient colors={[colors.blue[500], colors.blue[800]]} className="px-6 gap-6 pb-[18px]">
      <View className="flex flex-row justify-between items-center mt-[139px]">
        <View>
          <Text className="font-inter text-white text-sm">Total que você possui</Text>
          <Text className="font-inter text-white text-[32px]">{data.total}</Text>
        </View>

        <View className="flex-row gap-2 items-center">
          <HeaderIconButton icon="search" onPress={() => router.push('/search')} />
          <HeaderIconButton icon="repeat" onPress={() => router.push('/recurring')} />
          <HeaderIconButton icon="award" onPress={() => router.push('/achievements')} />
          <HeaderIconButton icon="settings" onPress={() => router.push('/settings')} />
          <TouchableOpacity
            className="p-2 rounded-2xl border border-blue-300/40"
            onPress={() => router.push('/reports')}
            activeOpacity={0.7}>
            <AntDesign name="piechart" color={colors.blue[100]} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <Separator color="#3E4587" />

      <View className="flex flex-row items-center justify-between">
        <Summary
          data={{ label: data.input.label, value: data.input.value }}
          icon={{ name: 'arrow-up', color: colors.green[500] }}
        />
        <Summary
          data={{ label: data.output.label, value: data.output.value }}
          icon={{ name: 'arrow-down', color: colors.red[400] }}
          isRight
        />
      </View>
    </LinearGradient>
  )
}

function HeaderIconButton({
  icon,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name']
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      className="p-2 rounded-2xl border border-blue-300/40"
      onPress={onPress}
      activeOpacity={0.7}>
      <Feather name={icon} color={colors.blue[100]} size={18} />
    </TouchableOpacity>
  )
}
