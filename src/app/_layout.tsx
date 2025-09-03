import { Slot } from 'expo-router'
import '../../global.css'
import { migrate } from '@/database/migrate'
import { SQLiteProvider } from 'expo-sqlite'
import { Suspense, useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { QueryClientProvider } from '@tanstack/react-query'

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter'

import { Loading } from '@/components/Loading'
import { queryClient } from '@/lib/query-client'
import { useOnlineManager } from '@/hooks/query/useOnlineManager'

import { useAppState } from '@/hooks/query/useAppState'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'react-native'

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
})

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  })

  useAppState()
  useOnlineManager()

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide()
    }
  }, [loaded])

  if (!loaded && !error) {
    return <Loading />
  }

  return (
    <Suspense fallback={<Loading />}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider onInit={migrate} databaseName="cofrin.db" useSuspense>
          <SafeAreaView className="flex-1 justify-center items-center" edges={['bottom']}>
            <Slot />
          </SafeAreaView>
        </SQLiteProvider>
      </QueryClientProvider>
    </Suspense>
  )
}
