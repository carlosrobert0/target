import { colors } from '@/theme/colors'
import { View, Text, TextInput, TextInputProps } from 'react-native'

type Props = TextInputProps & {
  label: string
}

export function Input({ label, ...rest }: Props) {
  return (
    <View className="gap-2.5">
      <Text className="text-gray-600 font-medium font-inter text-xs">{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor={colors.gray[400]}
        className="text-black font-inter text-base border-b border-gray-300 pb-3"
      />
    </View>
  )
}
