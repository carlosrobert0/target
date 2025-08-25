import { colors } from '@/theme/colors'
import { ActivityIndicator, View } from 'react-native'

export function Loading() {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator color={colors.blue[500]} />
    </View>
  )
}
