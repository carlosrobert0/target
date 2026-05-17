import { useEffect, useState } from 'react'
import { Alert, StatusBar, Switch, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'

import { PageHeader } from '@/components/PageHeader'
import { Loading } from '@/components/Loading'
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/hooks/services/notifications/useNotificationSettings'
import { getAppLockEnabled, setAppLockEnabled, hasHardware } from '@/lib/appLock'
import { colors } from '@/theme/colors'

export default function Settings() {
  const { data: settings, isLoading } = useNotificationSettings()
  const { mutate: update } = useUpdateNotificationSettings()
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [lockEnabled, setLockEnabled] = useState(false)
  const [lockHardware, setLockHardware] = useState(false)

  useEffect(() => {
    getAppLockEnabled().then(setLockEnabled)
    hasHardware().then(setLockHardware)
  }, [])

  async function toggleLock(value: boolean) {
    try {
      await setAppLockEnabled(value)
      setLockEnabled(value)
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível alterar a trava.')
    }
  }

  if (isLoading || !settings) return <Loading />

  return (
    <SafeAreaView className="flex-1 px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader title="Configurações" subtitle="Notificações e preferências do app." />

      <ScrollView className="mt-6" contentContainerStyle={{ gap: 24, paddingBottom: 32 }}>
        <View className="gap-3">
          <Text className="font-inter font-bold text-base text-black">Atalhos</Text>
          <NavRow
            icon="briefcase"
            label="Carteiras"
            description="Carteira, conta corrente, cartão."
            onPress={() => router.push('/wallets')}
          />
          <NavRow
            icon="download"
            label="Exportar e importar"
            description="CSV ou PDF do mês."
            onPress={() => router.push('/export')}
          />
          <NavRow
            icon="award"
            label="Conquistas"
            description="Veja os marcos que você atingiu."
            onPress={() => router.push('/achievements')}
          />
        </View>

        <View className="gap-3">
          <Text className="font-inter font-bold text-base text-black">Segurança</Text>
          <Row
            label="Trava por biometria/PIN"
            description={
              lockHardware
                ? 'Solicita autenticação para abrir o app.'
                : 'Dispositivo sem biometria/PIN configurado.'
            }
            value={lockEnabled}
            onChange={toggleLock}
            disabled={!lockHardware}
          />
        </View>

        <View className="gap-3">
          <Text className="font-inter font-bold text-base text-black">Notificações</Text>

          <Row
            label="Lembrete diário"
            description="Receba um aviso para registrar seus gastos."
            value={settings.daily_reminder_enabled === 1}
            onChange={(v) =>
              update({
                daily_reminder_enabled: v ? 1 : 0,
                daily_reminder_hour: settings.daily_reminder_hour,
                daily_reminder_minute: settings.daily_reminder_minute,
              })
            }
          />

          {settings.daily_reminder_enabled === 1 && (
            <TouchableOpacity
              className="bg-gray-100 rounded-lg p-3"
              onPress={() => setShowTimePicker((s) => !s)}>
              <Text className="font-inter text-xs text-gray-500">Horário</Text>
              <Text className="font-inter text-base text-black">
                {String(settings.daily_reminder_hour).padStart(2, '0')}:
                {String(settings.daily_reminder_minute).padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          )}

          {showTimePicker && settings.daily_reminder_enabled === 1 && (
            <View className="bg-gray-100 rounded-lg p-3">
              <Text className="font-inter text-xs text-gray-500 mb-2">Escolha a hora</Text>
              <View className="flex-row flex-wrap gap-2">
                {[7, 8, 9, 12, 18, 19, 20, 21, 22].map((h) => (
                  <TouchableOpacity
                    key={h}
                    className={`px-3 py-2 rounded-lg ${
                      settings.daily_reminder_hour === h ? 'bg-blue-500' : 'bg-white'
                    }`}
                    onPress={() =>
                      update({
                        daily_reminder_enabled: 1,
                        daily_reminder_hour: h,
                        daily_reminder_minute: 0,
                      })
                    }>
                    <Text
                      className={`font-inter text-sm ${
                        settings.daily_reminder_hour === h ? 'text-white' : 'text-gray-600'
                      }`}>
                      {String(h).padStart(2, '0')}:00
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Row
            label="Alerta de orçamento"
            description="Avisa quando você cruza o limite do mês em alguma categoria."
            value={settings.budget_alert_enabled === 1}
            onChange={(v) => update({ budget_alert_enabled: v ? 1 : 0 })}
          />

          {settings.budget_alert_enabled === 1 && (
            <View className="bg-gray-100 rounded-lg p-3">
              <Text className="font-inter text-xs text-gray-500 mb-2">Avisar a partir de</Text>
              <View className="flex-row gap-2">
                {[50, 70, 80, 90, 100].map((t) => (
                  <TouchableOpacity
                    key={t}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      settings.budget_alert_threshold === t ? 'bg-blue-500' : 'bg-white'
                    }`}
                    onPress={() => update({ budget_alert_threshold: t })}>
                    <Text
                      className={`font-inter text-sm ${
                        settings.budget_alert_threshold === t ? 'text-white' : 'text-gray-600'
                      }`}>
                      {t}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Row
            label="Conquistas"
            description="Avisa quando você atinge 100% de uma meta."
            value={settings.achievement_alert_enabled === 1}
            onChange={(v) => update({ achievement_alert_enabled: v ? 1 : 0 })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({
  label,
  description,
  value,
  onChange,
  disabled = false,
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <View
      className="flex-row items-center justify-between bg-gray-100 rounded-lg p-3"
      style={{ opacity: disabled ? 0.5 : 1 }}>
      <View className="flex-1 pr-3">
        <Text className="font-inter text-base text-black">{label}</Text>
        <Text className="font-inter text-xs text-gray-500">{description}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} />
    </View>
  )
}

function NavRow({
  icon,
  label,
  description,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name']
  label: string
  description: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-gray-100 rounded-lg p-3 gap-3"
      activeOpacity={0.7}
      onPress={onPress}>
      <Feather name={icon} size={18} color={colors.gray[600]} />
      <View className="flex-1">
        <Text className="font-inter text-base text-black">{label}</Text>
        <Text className="font-inter text-xs text-gray-500">{description}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.gray[500]} />
    </TouchableOpacity>
  )
}
