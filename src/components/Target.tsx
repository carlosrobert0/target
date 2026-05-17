import type { TargetProps } from '@/@types/target'
import { colors } from '@/theme/colors'
import { Feather } from '@expo/vector-icons'
import { TouchableOpacity, View, Text, type TouchableOpacityProps } from 'react-native'

type Props = TouchableOpacityProps & {
  data: TargetProps
}

export function Target({ data, ...rest }: Props) {
  return (
    <TouchableOpacity className="flex-row items-center pb-4" {...rest}>
      <View className="flex-1">
        <Text className="text-sm font-medium text-black dark:text-white font-inter">
          {data.name}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 font-inter text-xs">
          {data.percentage} • {data.current} de {data.target}
        </Text>
        {data.deadline && (
          <View className="flex-row items-center gap-1 mt-0.5">
            <Feather name="calendar" size={10} color={colors.gray[500]} />
            <Text className="text-gray-500 font-inter text-[10px]">
              até {data.deadline}
              {data.monthlyContribution
                ? ` · guarde ${data.monthlyContribution}/mês`
                : ''}
            </Text>
          </View>
        )}
      </View>
      <Feather name="chevron-right" size={20} color={colors.gray[500]} />
    </TouchableOpacity>
  )
}
