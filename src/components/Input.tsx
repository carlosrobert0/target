import { colors } from '@/theme/colors'
import { TextInput, TextInputProps } from 'react-native'

export function Input({ ...rest }: TextInputProps) {
  return (
    <TextInput
      {...rest}
      placeholderTextColor={colors.gray[550]}
      className="text-black font-inter text-base border-b border-gray-400"
    />
  )
}
