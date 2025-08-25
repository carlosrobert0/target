import { colors } from '@/theme/colors'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity, View, Text, type TouchableOpacityProps } from 'react-native'

export type TransactionProps = {
  id: string
  type: TransactionTypes
  createdAt: string
  description?: string
}

type Props = TouchableOpacityProps & {
  data: TransactionProps
}

export const typeIcons = {
  [TransactionTypes.Input]: 'arrow-up',
  [TransactionTypes.Output]: 'arrow-down',
}

const typeColors = {
  [TransactionTypes.Input]: colors.blue[500],
  [TransactionTypes.Output]: colors.red[400],
}

export function Transaction({ data, ...rest }: Props) {
  return (
    <TouchableOpacity className="flex flex-row items-center gap-2 pb-4" {...rest}>
      <Feather
        name={typeIcons[data.type] as keyof typeof Feather.glyphMap}
        size={24}
        color={typeColors[data.type]}
      />
      <View className="flex-1">
        <Text className="text-sm font-medium text-black font-inter">{data.description}</Text>
        <Text className="text-gray-600 font-inter text-xs">
          {data.createdAt}
          {data?.description && ` • ${data.description}`}
        </Text>
      </View>
      <MaterialIcons name="close" size={18} color={colors.gray[600]} />
    </TouchableOpacity>
  )
}
