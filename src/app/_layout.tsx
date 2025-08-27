import { Slot } from 'expo-router'
import { View } from 'react-native'
import '../../global.css'
import { migrate } from '@/database/migrate'
import { SQLiteProvider } from 'expo-sqlite'
import { Suspense } from 'react'

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter'

import { Loading } from '@/components/Loading'

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  })

  if (!loaded && !error) {
    return <Loading />
  }

  return (
    <Suspense fallback={<Loading />}>
      <SQLiteProvider onInit={migrate} databaseName="cofrin.db" useSuspense>
        <View className="flex-1 justify-center items-center">
          <Slot />
        </View>
      </SQLiteProvider>
    </Suspense>
  )
}
