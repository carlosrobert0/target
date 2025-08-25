import { colors } from '@/theme/colors'
import {
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native'

type Props = TouchableOpacityProps & {
  title: string
  isProcessing?: boolean
  className?: string
}

export function Button({
  title = 'Nova meta',
  isProcessing = false,
  className = '',
  ...rest
}: Props) {
  return (
    <TouchableOpacity
      className={`bg-blue-500 h-12 rounded-lg items-center justify-center ${className}`}
      disabled={isProcessing}
      activeOpacity={0.7}
      {...rest}>
      <Text className="font-inter  text-white text-sm">
        {isProcessing ? <ActivityIndicator size="small" color={colors.white} /> : title}
      </Text>
    </TouchableOpacity>
  )
}
