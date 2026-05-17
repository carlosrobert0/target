import { useState } from 'react'
import {
  Alert,
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { useListWalletsWithBalance } from '@/hooks/services/wallets/useListWallets'
import {
  useArchiveWallet,
  useCreateWallet,
} from '@/hooks/services/wallets/useCreateWallet'
import { useListTransfers } from '@/hooks/services/transfers/useListTransfers'
import { colors } from '@/theme/colors'

const COLOR_DOT: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-400',
  yellow: 'bg-yellow-500',
}

const COLORS = ['blue', 'green', 'red', 'yellow'] as const

export default function Wallets() {
  const { data, isLoading } = useListWalletsWithBalance()
  const { data: transfers } = useListTransfers()
  const { mutate: create, isPending } = useCreateWallet()
  const { mutate: archive } = useArchiveWallet()

  const [name, setName] = useState('')
  const [color, setColor] = useState<string>('blue')

  function handleCreate() {
    if (!name.trim()) return
    create(
      { name: name.trim(), color },
      {
        onSuccess: () => {
          setName('')
          setColor('blue')
        },
      },
    )
  }

  function handleArchive(id: number, walletName: string) {
    Alert.alert(
      'Arquivar carteira',
      `Arquivar "${walletName}"? As transações ligadas a ela serão mantidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Arquivar', style: 'destructive', onPress: () => archive(id) },
      ],
    )
  }

  const recentTransfers = transfers?.slice(0, 5) ?? []

  return (
    <SafeAreaView
      className="flex-1 px-6 bg-background dark:bg-gray-900"
      edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader
        title="Carteiras"
        subtitle="Separe seus fluxos por fonte (cash, conta, cartão)."
      />

      <ScrollView
        contentContainerStyle={{ paddingVertical: 16, gap: 16, paddingBottom: 32 }}>
        <FlatList
          data={data}
          scrollEnabled={false}
          keyExtractor={(w) => String(w.id)}
          contentContainerStyle={{ gap: 8 }}
          ListEmptyComponent={
            <Text className="font-inter text-gray-500 text-center mt-8">
              {isLoading ? 'Carregando...' : 'Nenhuma carteira ainda.'}
            </Text>
          }
          renderItem={({ item }) => (
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View
                  className={`${COLOR_DOT[item.color] ?? 'bg-blue-500'} w-9 h-9 rounded-full items-center justify-center`}>
                  <Feather name={(item.icon as any) ?? 'credit-card'} size={16} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter font-medium text-base text-black dark:text-white">
                    {item.name}
                  </Text>
                  <Text className="font-inter text-xs text-gray-500 dark:text-gray-400">
                    {item.transaction_count} transações · saldo {item.balanceLabel}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleArchive(item.id, item.name)}>
                <Feather name="archive" size={16} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>
          )}
        />

        <Button
          title="Nova transferência"
          onPress={() => router.push('/transfer')}
        />

        {recentTransfers.length > 0 && (
          <View className="gap-2">
            <Text className="font-inter font-bold text-sm text-black dark:text-white">
              Transferências recentes
            </Text>
            {recentTransfers.map((tr) => (
              <View
                key={tr.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text className="font-inter text-sm text-black dark:text-white">
                    {tr.from_wallet_name} → {tr.to_wallet_name}
                  </Text>
                  <Text className="font-inter text-xs text-gray-500">
                    {tr.dateLabel}
                    {tr.observation ? ` · ${tr.observation}` : ''}
                  </Text>
                </View>
                <Text className="font-inter font-bold text-sm text-blue-500">
                  {tr.amountLabel}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 gap-3">
          <Text className="font-inter font-bold text-sm text-black dark:text-white">
            Nova carteira
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Cartão Inter"
            placeholderTextColor={colors.gray[400]}
            className="bg-white dark:bg-gray-900 rounded-lg px-3 py-2 font-inter text-sm text-black dark:text-white"
          />
          <View className="flex-row gap-2">
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                className={`${COLOR_DOT[c]} w-9 h-9 rounded-full items-center justify-center`}
                style={{ borderWidth: color === c ? 3 : 0, borderColor: 'black' }}>
                {color === c && <Feather name="check" size={14} color="white" />}
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Adicionar" onPress={handleCreate} isProcessing={isPending} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
