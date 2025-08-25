import { Slot } from 'expo-router'
import { StatusBar, View } from 'react-native'
import '../../global.css'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter'

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  })

  if (!loaded && !error) {
    return null
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Slot />
    </View>
  )
}
