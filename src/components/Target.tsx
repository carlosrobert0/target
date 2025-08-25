import { colors } from '@/theme/colors'
import { Feather } from '@expo/vector-icons'
import { TouchableOpacity, View, Text, type TouchableOpacityProps } from 'react-native'

export type TargetProps = {
  id?: string
  name: string
  percentage: string
  current: string
  target: string
}

type Props = TouchableOpacityProps & {
  data: TargetProps
}

export function Target({ data, ...rest }: Props) {
  return (
    <TouchableOpacity className="flex-row items-center pb-4" {...rest}>
      <View className="flex-1">
        <Text className="text-sm font-medium text-black font-inter">{data.name}</Text>
        <Text className="text-gray-600 font-inter">
          {data.percentage} • R$ {data.current} de R$ {data.target}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.black} />
    </TouchableOpacity>
  )
}
