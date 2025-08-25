import { colors } from '@/theme/colors'
import { View, Text } from 'react-native'
import Input, { CurrencyInputProps } from 'react-native-currency-input'

type Props = CurrencyInputProps & {
  label: string
}

export function CurrencyInput({ label, ...rest }: Props) {
  return (
    <View className="gap-2.5">
      <Text className="text-gray-600 font-medium font-inter text-xs">{label}</Text>
      <Input
        {...rest}
        placeholderTextColor={colors.gray[400]}
        delimiter="."
        separator=","
        precision={2}
        minValue={0}
      />
    </View>
  )
}
