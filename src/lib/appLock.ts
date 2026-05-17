import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'

const LOCK_KEY = 'app_lock_enabled_v1'

export async function getAppLockEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(LOCK_KEY)) === '1'
}

export async function setAppLockEnabled(value: boolean) {
  if (value) {
    const ok = await hasHardware()
    if (!ok) {
      throw new Error('Configure biometria ou PIN nas configurações do dispositivo.')
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirme para ativar a trava',
      fallbackLabel: 'Usar PIN',
    })
    if (!result.success) throw new Error('Autenticação cancelada.')
  }
  await AsyncStorage.setItem(LOCK_KEY, value ? '1' : '0')
}

export async function hasHardware(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync()
  if (!compatible) return false
  const enrolled = await LocalAuthentication.isEnrolledAsync()
  return enrolled
}

export async function authenticate(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Desbloquear Cofrin',
    fallbackLabel: 'Usar PIN',
    disableDeviceFallback: false,
  })
  return result.success
}
