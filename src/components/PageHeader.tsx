import { View, Text, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import { router } from 'expo-router'

type Props = {
  title: string
  subtitle?: string
  rightButton?: {
    icon: keyof typeof MaterialIcons.glyphMap
    onPress: () => void
  }
}

export function PageHeader({ title, subtitle, rightButton }: Props) {
  return (
    <View className="pt-8">
      <View className="flex-row justify-between items-center w-full mb-8">
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>

        {rightButton && (
          <TouchableOpacity onPress={rightButton.onPress}>
            <MaterialIcons name={rightButton.icon} size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-2xl text-black font-inter font-bold mt-2">{title}</Text>
      {subtitle && <Text className="text-gray-500 font-inter text-sm">{subtitle}</Text>}
    </View>
  )
}
