import { useEffect } from 'react'
import { AppState, Platform, type AppStateStatus } from 'react-native'
import { focusManager } from '@tanstack/react-query'

export function useAppState() {
  function onAppStateChange(status: AppStateStatus) {
    if (Platform.OS !== 'web') {
      focusManager.setFocused(status === 'active')
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange)

    return () => subscription.remove()
  }, [])
}
