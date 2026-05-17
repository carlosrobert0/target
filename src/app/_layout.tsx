import { Slot, router } from 'expo-router'
import '../../global.css'
import { migrate } from '@/database/migrate'
import { SQLiteProvider } from 'expo-sqlite'
import { Suspense, useEffect, useState } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { QueryClientProvider } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
import { useProcessRecurring } from '@/hooks/useProcessRecurring'
import { useAppLock } from '@/hooks/useAppLock'
import { configureNotificationHandler } from '@/lib/notifications'
import { SafeAreaView } from 'react-native-safe-area-context'

configureNotificationHandler()

SplashScreen.setOptions({ duration: 1000, fade: true })
SplashScreen.preventAutoHideAsync()

const ONBOARDING_KEY = 'onboarding_completed_v1'

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  })

  useAppState()
  useOnlineManager()

  useEffect(() => {
    if (loaded) SplashScreen.hide()
  }, [loaded])

  if (!loaded && !error) return <Loading />

  return (
    <Suspense fallback={<Loading />}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider onInit={migrate} databaseName="cofrin.db" useSuspense>
          <AppBootstrap />
          <SafeAreaView
            className="flex-1 justify-center items-center bg-background dark:bg-gray-900"
            edges={['bottom']}>
            <Slot />
          </SafeAreaView>
        </SQLiteProvider>
      </QueryClientProvider>
    </Suspense>
  )
}

function AppBootstrap() {
  useProcessRecurring()
  useAppLock()
  useOnboardingGuard()
  return null
}

function useOnboardingGuard() {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    if (checked) return
    AsyncStorage.getItem(ONBOARDING_KEY).then((done) => {
      if (!done) router.replace('/onboarding')
      setChecked(true)
    })
  }, [checked])
}
