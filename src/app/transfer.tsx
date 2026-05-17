import { useState } from 'react'
import { Platform, StatusBar, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { CurrencyInput } from '@/components/CurrencyInput'
import { useListWallets } from '@/hooks/services/wallets/useListWallets'
import { useCreateTransfer } from '@/hooks/services/transfers/useCreateTransfer'
import { colors } from '@/theme/colors'

const COLOR_DOT: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-400',
  yellow: 'bg-yellow-500',
}

export default function Transfer() {
  const { data: wallets } = useListWallets()
  const { mutate, isPending } = useCreateTransfer()

  const [fromId, setFromId] = useState<number | null>(null)
  const [toId, setToId] = useState<number | null>(null)
  const [amount, setAmount] = useState(0)
  const [observation, setObservation] = useState('')
  const [occurredAt, setOccurredAt] = useState<Date>(new Date())
  const [showDate, setShowDate] = useState(false)

  function handleDateChange(_: DateTimePickerEvent, picked?: Date) {
    if (Platform.OS === 'android') setShowDate(false)
    if (picked) setOccurredAt(picked)
  }

  function handleSubmit() {
    if (!fromId || !toId || fromId === toId || amount <= 0) return
    mutate({
      from_wallet_id: fromId,
      to_wallet_id: toId,
      amount,
      observation: observation || undefined,
      occurred_at: occurredAt.toISOString(),
    })
  }

  const canSubmit = fromId && toId && fromId !== toId && amount > 0

  return (
    <SafeAreaView className="flex-1 px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader
        title="Nova transferência"
        subtitle="Mova saldo entre carteiras sem afetar suas metas."
      />

      <ScrollView className="mt-6" contentContainerStyle={{ gap: 20, paddingBottom: 32 }}>
        <WalletSection
          label="De"
          wallets={wallets ?? []}
          selectedId={fromId}
          onSelect={setFromId}
          excludeId={toId}
        />

        <View className="items-center">
          <View className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
            <Feather name="arrow-down" size={20} color={colors.gray[500]} />
          </View>
        </View>

        <WalletSection
          label="Para"
          wallets={wallets ?? []}
          selectedId={toId}
          onSelect={setToId}
          excludeId={fromId}
        />

        <CurrencyInput
          label="Valor (R$)"
          placeholder="100,00"
          value={amount}
          onChangeValue={(v: number) => setAmount(v)}
        />

        <View>
          <Text className="font-inter text-sm text-gray-600 mb-2">Data</Text>
          <TouchableOpacity
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex-row items-center justify-between"
            onPress={() => setShowDate(true)}>
            <Text className="font-inter text-base text-black dark:text-white">
              {occurredAt.toLocaleDateString('pt-BR')}
            </Text>
            <Feather name="calendar" size={18} color={colors.gray[500]} />
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={occurredAt}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
          {Platform.OS === 'ios' && showDate && (
            <TouchableOpacity
              className="bg-blue-500 rounded-lg p-2 mt-2 items-center"
              onPress={() => setShowDate(false)}>
              <Text className="font-inter text-white text-sm">Confirmar</Text>
            </TouchableOpacity>
          )}
        </View>

        <Input
          label="Observação"
          placeholder="Ex: Saque para a carteira"
          value={observation}
          onChangeText={setObservation}
        />

        <Button
          title="Transferir"
          onPress={handleSubmit}
          isProcessing={isPending}
          style={{ opacity: canSubmit ? 1 : 0.5 }}
          disabled={!canSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

function WalletSection({
  label,
  wallets,
  selectedId,
  onSelect,
  excludeId,
}: {
  label: string
  wallets: { id: number; name: string; color: string }[]
  selectedId: number | null
  onSelect: (id: number) => void
  excludeId: number | null
}) {
  return (
    <View>
      <Text className="font-inter text-sm text-gray-600 mb-2">{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {wallets.map((w) => {
          const disabled = w.id === excludeId
          const selected = w.id === selectedId
          return (
            <TouchableOpacity
              key={w.id}
              disabled={disabled}
              onPress={() => onSelect(w.id)}
              className={`flex-row items-center gap-2 px-4 py-2 rounded-xl ${
                selected ? COLOR_DOT[w.color] ?? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'
              }`}
              style={{ opacity: disabled ? 0.3 : 1 }}>
              <Text
                className={`font-inter text-sm ${
                  selected ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                }`}>
                {w.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}
