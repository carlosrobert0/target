import { View, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'

type Props = TouchableOpacityProps & {
  title?: string
  className?: string
}

export function Button({
  title = "Nova meta",
  className,
  ...rest
}: Props) {
  return (
    <TouchableOpacity
      className={`bg-blue-500 h-12 rounded-lg items-center justify-center mx-6 mb-6 ${className}`}
      {...rest}
    >
      <Text className="font-inter text-white text-sm">{title}</Text>
    </TouchableOpacity>
  )
}