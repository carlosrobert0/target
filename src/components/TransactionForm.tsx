import { useEffect, useState } from 'react'
import { Platform, TouchableOpacity, View, Text } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Feather } from '@expo/vector-icons'

import { TransactionType } from '@/components/TransactionType'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { TagPicker } from '@/components/TagPicker'
import { WalletPicker } from '@/components/WalletPicker'
import { ReceiptPicker } from '@/components/ReceiptPicker'
import { Button } from '@/components/Button'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { TransactionCategories } from '@/utils/TransactionCategories'
import { useListWallets } from '@/hooks/services/wallets/useListWallets'
import { colors } from '@/theme/colors'

export type TransactionFormValues = {
  type: TransactionTypes
  amount: number
  observation: string
  category: string
  walletId: number | null
  receiptUri: string | null
  tagIds: number[]
  occurredAt: Date
}

type Props = {
  initial?: Partial<TransactionFormValues>
  submitting?: boolean
  submitLabel?: string
  onSubmit: (values: TransactionFormValues) => void
}

const CATEGORY_OPTIONS = [
  { label: TransactionCategories.FOOD, value: TransactionCategories.FOOD, icon: 'coffee' },
  { label: TransactionCategories.TRANSPORT, value: TransactionCategories.TRANSPORT, icon: 'truck' },
  { label: TransactionCategories.LEISURE, value: TransactionCategories.LEISURE, icon: 'sun' },
  { label: TransactionCategories.HEALTH, value: TransactionCategories.HEALTH, icon: 'heart' },
  { label: TransactionCategories.EDUCATION, value: TransactionCategories.EDUCATION, icon: 'book' },
  { label: TransactionCategories.HOUSING, value: TransactionCategories.HOUSING, icon: 'home' },
  { label: TransactionCategories.CLOTHING, value: TransactionCategories.CLOTHING, icon: 'shopping-bag' },
  { label: TransactionCategories.ENTERTAINMENT, value: TransactionCategories.ENTERTAINMENT, icon: 'tv' },
  { label: TransactionCategories.TECHNOLOGY, value: TransactionCategories.TECHNOLOGY, icon: 'smartphone' },
  { label: TransactionCategories.OTHER, value: TransactionCategories.OTHER, icon: 'more-horizontal' },
]

export function TransactionForm({ initial, submitting, submitLabel = 'Salvar', onSubmit }: Props) {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      type: initial?.type ?? TransactionTypes.Input,
      amount: initial?.amount ?? 0,
      observation: initial?.observation ?? '',
      category: initial?.category ?? '',
    },
  })

  const type = watch('type')
  const [tagIds, setTagIds] = useState<number[]>(initial?.tagIds ?? [])
  const [walletId, setWalletId] = useState<number | null>(initial?.walletId ?? null)
  const [receiptUri, setReceiptUri] = useState<string | null>(initial?.receiptUri ?? null)
  const [occurredAt, setOccurredAt] = useState<Date>(initial?.occurredAt ?? new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  const { data: wallets } = useListWallets()
  useEffect(() => {
    if (walletId == null && wallets && wallets.length > 0) {
      setWalletId(wallets[0].id)
    }
  }, [wallets])

  function handleDateChange(_: DateTimePickerEvent, picked?: Date) {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (picked) setOccurredAt(picked)
  }

  function submit(formValues: { type: TransactionTypes; amount: number; observation: string; category: string }) {
    onSubmit({
      type: formValues.type,
      amount: formValues.amount,
      observation: formValues.observation,
      category: formValues.category,
      walletId,
      receiptUri,
      tagIds,
      occurredAt,
    })
  }

  return (
    <View style={{ gap: 24 }}>
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <TransactionType selected={value} onChange={onChange} />
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput
            label="Valor (R$)"
            placeholder="50,00"
            value={value}
            onChangeValue={onChange}
          />
        )}
      />

      <WalletPicker selectedId={walletId} onChange={setWalletId} />

      <View>
        <Text className="font-inter text-sm text-gray-600 mb-2">Data</Text>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex-row items-center justify-between"
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}>
          <Text className="font-inter text-base text-black dark:text-white">
            {occurredAt.toLocaleDateString('pt-BR')}
          </Text>
          <Feather name="calendar" size={18} color={colors.gray[500]} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={occurredAt}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
        {Platform.OS === 'ios' && showDatePicker && (
          <TouchableOpacity
            className="bg-blue-500 rounded-lg p-2 mt-2 items-center"
            onPress={() => setShowDatePicker(false)}>
            <Text className="font-inter text-white text-sm">Confirmar</Text>
          </TouchableOpacity>
        )}
      </View>

      <Controller
        control={control}
        name="observation"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Motivo"
            placeholder="Ex: Investir em CDB de 110% no banco XPTO"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      {type === TransactionTypes.Output && (
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Categoria"
              placeholder="Selecione uma categoria"
              value={value}
              options={CATEGORY_OPTIONS}
              onValueChange={onChange}
            />
          )}
        />
      )}

      <TagPicker selectedIds={tagIds} onChange={setTagIds} />

      <ReceiptPicker uri={receiptUri} onChange={setReceiptUri} />

      <Button
        title={submitLabel}
        className="mx-0"
        onPress={handleSubmit(submit)}
        isProcessing={submitting}
      />
    </View>
  )
}
