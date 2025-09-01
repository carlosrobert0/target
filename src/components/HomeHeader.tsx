import { colors } from '@/theme/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { Separator } from './Separator'
import { View, Text } from 'react-native'
import { Summary, type SummaryProps } from './Summary'

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
      <View className="mt-[139px]">
        <Text className="font-inter text-white text-sm">Total que você possui</Text>
        <Text className="font-inter text-white text-[32px]">{data.total}</Text>
      </View>
      <Separator color="#3E4587" />
      <View className="flex flex-row items-center justify-between">
        <Summary
          data={{
            label: data.input.label,
            value: data.input.value,
          }}
          icon={{
            name: 'arrow-up',
            color: colors.green[500],
          }}
        />

        <Summary
          data={{
            label: data.output.label,
            value: data.output.value,
          }}
          icon={{
            name: 'arrow-down',
            color: colors.red[400],
          }}
          isRight
        />
      </View>
    </LinearGradient>
  )
}
