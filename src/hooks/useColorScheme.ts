import { useColorScheme as useRNColorScheme } from 'react-native'

export function useIsDark(): boolean {
  return useRNColorScheme() === 'dark'
}

export function useStatusBarStyle(): 'light-content' | 'dark-content' {
  return useIsDark() ? 'light-content' : 'dark-content'
}
