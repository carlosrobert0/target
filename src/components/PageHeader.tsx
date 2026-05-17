import { View, Text, TouchableOpacity, useColorScheme } from 'react-native'
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
  const isDark = useColorScheme() === 'dark'
  const iconColor = isDark ? colors.white : colors.black
  const rightColor = isDark ? colors.gray[400] : colors.gray[600]

  return (
    <View className="pt-8">
      <View className="flex-row justify-between items-center w-full mb-8">
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>

        {rightButton && (
          <TouchableOpacity onPress={rightButton.onPress}>
            <MaterialIcons name={rightButton.icon} size={24} color={rightColor} />
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-2xl text-black dark:text-white font-inter font-bold mt-2">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-gray-500 dark:text-gray-400 font-inter text-sm">{subtitle}</Text>
      )}
    </View>
  )
}
