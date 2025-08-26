import { Pressable, PressableProps, type ColorValue, Text } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { colors } from '@/theme'

type Props = PressableProps & {
  isSelected: boolean
  title: string
  icon: keyof typeof MaterialIcons.glyphMap
  selectedColor: ColorValue
}

export function Option({ isSelected, title, icon, selectedColor, ...rest }: Props) {
  const selectedIconColor = isSelected ? colors.white : colors.gray[500]
  const selectedTextColor = isSelected ? 'text-white' : 'text-gray-500'

  return (
    <Pressable
      {...rest}
      className={`flex-1 flex-row items-center rounded-lg gap-2 h-full justify-center`}
      style={{ backgroundColor: isSelected ? (selectedColor as string) : colors.gray[100] }}>
      <MaterialIcons name={icon} size={24} color={selectedIconColor} />
      <Text className={`font-inter text-sm ${selectedTextColor}`}>{title}</Text>
    </Pressable>
  )
}
