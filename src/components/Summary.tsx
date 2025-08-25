import type { ComponentProps } from 'react'
import { View, Text, ColorValue } from 'react-native'
import { Feather } from '@expo/vector-icons'

export type SummaryProps = {
  label: string
  value: string
}

type Props = {
  data: SummaryProps
  icon: {
    name: keyof typeof Feather.glyphMap
    color: ColorValue
  }
  isRight?: boolean
}

export function Summary({ data, icon, isRight = false }: Props) {
  return (
    <View className={`flex-1 ${isRight ? 'items-end' : 'items-start'} gap-1`}>
      <View className="flex flex-row items-center gap-1">
        <Feather name={icon.name} size={16} color={icon.color} />
        <Text className="font-inter text-xs text-white">{data.label}</Text>
      </View>
      <Text className="font-inter text-white text-lg">{data.value}</Text>
    </View>
  )
}
