import { useState } from 'react'
import { Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'

import { Button } from '@/components/Button'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Input } from '@/components/Input'
import { PageHeader } from '@/components/PageHeader'
import { useCreateTarget } from '@/hooks/services/targets/useCreateTarget'
import { colors } from '@/theme/colors'

type FormValues = {
  name: string
  amount: number
}

export default function NewTarget() {
  const { mutate, isPending } = useCreateTarget()
  const [deadline, setDeadline] = useState<Date | null>(null)
  const [showDate, setShowDate] = useState(false)

  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: { name: '', amount: 0 },
  })

  function handleDateChange(_: DateTimePickerEvent, picked?: Date) {
    if (Platform.OS === 'android') setShowDate(false)
    if (picked) setDeadline(picked)
  }

  function handleSave(values: FormValues) {
    mutate({
      name: values.name,
      amount: values.amount,
      target_date: deadline?.toISOString() ?? null,
    })
  }

  return (
    <SafeAreaView className="size-full px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader title="" subtitle="Economize para alcançar sua meta financeira." />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 24, paddingTop: 24, paddingBottom: 32 }}>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nome da meta"
              placeholder="Ex: Viagem para a praia, Apple Watch"
              onBlur={onBlur}
              value={value}
              onChangeText={onChange}
            />
          )}
          name="name"
        />

        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <CurrencyInput
              label="Valor alvo (R$)"
              placeholder="0,00"
              value={value}
              onChangeValue={onChange}
              onBlur={onBlur}
            />
          )}
          name="amount"
        />

        <View>
          <Text className="font-inter text-sm text-gray-600 mb-2">Prazo (opcional)</Text>
          <TouchableOpacity
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex-row items-center justify-between"
            onPress={() => setShowDate(true)}>
            <Text className="font-inter text-base text-black dark:text-white">
              {deadline ? deadline.toLocaleDateString('pt-BR') : 'Sem prazo definido'}
            </Text>
            <View className="flex-row items-center gap-2">
              {deadline && (
                <TouchableOpacity onPress={() => setDeadline(null)}>
                  <Feather name="x" size={16} color={colors.red[400]} />
                </TouchableOpacity>
              )}
              <Feather name="calendar" size={18} color={colors.gray[500]} />
            </View>
          </TouchableOpacity>
          <Text className="font-inter text-xs text-gray-500 dark:text-gray-400 mt-1">
            Se definido, o app vai sugerir quanto guardar por mês.
          </Text>
          {showDate && (
            <DateTimePicker
              value={deadline ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
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

        <Button
          title="Salvar"
          className="mx-0"
          onPress={handleSubmit(handleSave)}
          isProcessing={isPending}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
