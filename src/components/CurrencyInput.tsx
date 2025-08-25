import { colors } from '@/theme/colors'
import { TextInput, TextInputProps } from 'react-native'

export function CurrencyInput({ ...rest }: TextInputProps) {
  return (
    <TextInput
      {...rest}
      keyboardType="numeric"
      placeholderTextColor={colors.gray[550]}
      className="text-black font-inter text-base border-b border-gray-400"
    />
  )
}
