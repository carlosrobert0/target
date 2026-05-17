import { useEffect, useState } from 'react'
import { StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { authenticate } from '@/lib/appLock'
import { colors } from '@/theme/colors'

export default function Locked() {
  const [attempting, setAttempting] = useState(false)

  async function tryUnlock() {
    setAttempting(true)
    try {
      const ok = await authenticate()
      if (ok) router.replace('/')
    } finally {
      setAttempting(false)
    }
  }

  useEffect(() => {
    tryUnlock()
  }, [])

  return (
    <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" translucent />
      <LinearGradient
        colors={[colors.blue[500], colors.blue[800]]}
        className="flex-1 px-6 justify-center items-center gap-6">
        <View className="bg-white/15 rounded-full p-6">
          <Feather name="lock" size={48} color="white" />
        </View>
        <View className="gap-1">
          <Text className="font-inter font-bold text-white text-2xl text-center">
            Cofrin trancado
          </Text>
          <Text className="font-inter text-blue-100 text-sm text-center">
            Use sua biometria ou PIN para continuar.
          </Text>
        </View>
        <TouchableOpacity
          className="bg-white rounded-xl px-6 py-3"
          onPress={tryUnlock}
          disabled={attempting}>
          <Text className="font-inter font-bold text-blue-600">
            {attempting ? 'Tentando...' : 'Desbloquear'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  )
}
