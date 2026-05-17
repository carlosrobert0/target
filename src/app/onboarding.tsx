import { useState } from 'react'
import { StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '@/theme/colors'

const STEPS = [
  {
    icon: 'target' as const,
    title: 'Defina suas metas',
    description:
      'Crie metas de quanto você quer guardar. Pode ser pra viagem, reserva de emergência, ou qualquer objetivo.',
  },
  {
    icon: 'repeat' as const,
    title: 'Registre suas transações',
    description:
      'Anote entradas (salário, freelance) e saídas (aluguel, contas). O Cofrin te mostra como você está caminhando.',
  },
  {
    icon: 'bar-chart-2' as const,
    title: 'Visualize seu progresso',
    description:
      'Veja relatórios mensais, gastos por categoria e a regra 50/30/20 aplicada ao seu orçamento.',
  },
]

const ONBOARDING_KEY = 'onboarding_completed_v1'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  async function finish() {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1')
    router.replace('/')
  }

  function next() {
    if (isLast) finish()
    else setStep((s) => s + 1)
  }

  return (
    <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" translucent />
      <LinearGradient
        colors={[colors.blue[500], colors.blue[800]]}
        className="flex-1 px-6 justify-between py-12">
        <View className="items-end">
          <TouchableOpacity onPress={finish}>
            <Text className="font-inter text-blue-100 text-sm">Pular</Text>
          </TouchableOpacity>
        </View>

        <View className="gap-6 items-center">
          <View className="bg-white/15 rounded-full p-8">
            <Feather name={current.icon} size={56} color="white" />
          </View>
          <Text className="font-inter font-bold text-white text-3xl text-center">
            {current.title}
          </Text>
          <Text className="font-inter text-blue-100 text-base text-center px-4">
            {current.description}
          </Text>
        </View>

        <View className="gap-6">
          <View className="flex-row gap-2 justify-center">
            {STEPS.map((_, idx) => (
              <View
                key={idx}
                className={`h-1.5 rounded-full ${
                  idx === step ? 'bg-white w-6' : 'bg-white/30 w-1.5'
                }`}
              />
            ))}
          </View>

          <TouchableOpacity
            className="bg-white rounded-xl h-14 items-center justify-center"
            onPress={next}
            activeOpacity={0.8}>
            <Text className="font-inter font-bold text-blue-600 text-base">
              {isLast ? 'Começar' : 'Próximo'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}
