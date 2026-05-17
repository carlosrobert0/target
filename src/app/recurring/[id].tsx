import { useEffect, useState } from 'react'
import { StatusBar, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Controller, useForm } from 'react-hook-form'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { CurrencyInput } from '@/components/CurrencyInput'
import { TransactionType } from '@/components/TransactionType'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { TransactionCategories } from '@/utils/TransactionCategories'
import { useListTargets } from '@/hooks/services/targets/useFindAllTargets'
import { useCreateRecurring } from '@/hooks/services/recurring/useCreateRecurring'
import { useUpdateRecurring } from '@/hooks/services/recurring/useUpdateRecurring'
import { useRecurringTransactionDatabase } from '@/database/useRecurringTransactionDatabase'
import type { Frequency, RecurringCreate } from '@/@types/recurring'
import { colors } from '@/theme/colors'

const frequencyOptions = [
  { label: 'Diariamente', value: 'daily' },
  { label: 'Semanalmente', value: 'weekly' },
  { label: 'Mensalmente', value: 'monthly' },
  { label: 'Anualmente', value: 'yearly' },
]

const categoryOptions = Object.values(TransactionCategories).map((c) => ({ label: c, value: c }))

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

type FormValues = {
  target_id: number
  amount: number
  observation: string
  type: TransactionTypes
  category: string
  frequency: Frequency
  day_of_month: number
  day_of_week: number
}

export default function RecurringForm() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const isNew = id === 'new'

  const { data: targets } = useListTargets()
  const { show } = useRecurringTransactionDatabase()
  const { mutate: create, isPending: creating } = useCreateRecurring()
  const { mutate: update, isPending: updating } = useUpdateRecurring()

  const [loadingEdit, setLoadingEdit] = useState(!isNew)
  const [targetOptions, setTargetOptions] = useState<{ label: string; value: string }[]>([])

  const { control, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      target_id: 0,
      amount: 0,
      observation: '',
      type: TransactionTypes.Output,
      category: '',
      frequency: 'monthly',
      day_of_month: new Date().getDate(),
      day_of_week: 1,
    },
  })

  const type = watch('type')
  const frequency = watch('frequency')
  const dayOfMonth = watch('day_of_month')
  const dayOfWeek = watch('day_of_week')

  useEffect(() => {
    if (targets) {
      setTargetOptions(targets.map((t) => ({ label: t.name, value: String(t.id) })))
    }
  }, [targets])

  useEffect(() => {
    if (isNew || !id) return
    show(Number(id)).then((rec) => {
      if (!rec) { router.back(); return }
      const isExpense = rec.amount < 0
      reset({
        target_id: rec.target_id,
        amount: Math.abs(rec.amount),
        observation: rec.observation ?? '',
        type: isExpense ? TransactionTypes.Output : TransactionTypes.Input,
        category: rec.category ?? '',
        frequency: rec.frequency,
        day_of_month: rec.day_of_month ?? new Date().getDate(),
        day_of_week: rec.day_of_week ?? 1,
      })
      setLoadingEdit(false)
    })
  }, [id, isNew])

  function onSubmit(values: FormValues) {
    if (!values.target_id) return
    const signed =
      values.type === TransactionTypes.Output ? -Math.abs(values.amount) : values.amount
    const payload: Partial<RecurringCreate> = {
      target_id: Number(values.target_id),
      amount: signed,
      observation: values.observation || undefined,
      category: values.type === TransactionTypes.Output ? values.category || undefined : undefined,
      frequency: values.frequency,
      day_of_month: values.frequency === 'monthly' ? values.day_of_month : undefined,
      day_of_week: values.frequency === 'weekly' ? values.day_of_week : undefined,
    }

    if (isNew) {
      create({ ...payload, start_date: Date.now() } as RecurringCreate)
    } else {
      update({ id: Number(id), data: payload })
    }
  }

  if (loadingEdit) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.blue[500]} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader
        title={isNew ? 'Nova recorrência' : 'Editar recorrência'}
        subtitle="Lançamentos automáticos no intervalo escolhido."
      />

      <ScrollView className="mt-6" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <TransactionType selected={value} onChange={onChange} />
          )}
        />

        <Controller
          control={control}
          name="target_id"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Meta"
              placeholder="Selecione a meta"
              value={String(value || '')}
              options={targetOptions}
              onValueChange={(v) => onChange(Number(v))}
            />
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

        <Controller
          control={control}
          name="observation"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Descrição"
              placeholder="Ex: Netflix"
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="frequency"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Frequência"
              value={value}
              options={frequencyOptions}
              onValueChange={(v) => onChange(v as Frequency)}
            />
          )}
        />

        {frequency === 'monthly' && (
          <View>
            <Text className="font-inter text-sm text-gray-600 mb-2">Dia do mês</Text>
            <View className="flex-row flex-wrap gap-2">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setValue('day_of_month', d)}
                  className={`w-10 h-10 rounded-lg items-center justify-center ${
                    dayOfMonth === d ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                  <Text
                    className={`font-inter text-sm ${
                      dayOfMonth === d ? 'text-white' : 'text-gray-600'
                    }`}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {frequency === 'weekly' && (
          <View>
            <Text className="font-inter text-sm text-gray-600 mb-2">Dia da semana</Text>
            <View className="flex-row gap-2">
              {weekdayLabels.map((label, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setValue('day_of_week', idx)}
                  className={`flex-1 h-10 rounded-lg items-center justify-center ${
                    dayOfWeek === idx ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                  <Text
                    className={`font-inter text-xs ${
                      dayOfWeek === idx ? 'text-white' : 'text-gray-600'
                    }`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {type === TransactionTypes.Output && (
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Categoria"
                placeholder="Selecione uma categoria"
                value={value}
                options={categoryOptions}
                onValueChange={onChange}
              />
            )}
          />
        )}

        <Button
          title={isNew ? 'Criar recorrência' : 'Salvar alterações'}
          onPress={handleSubmit(onSubmit)}
          isProcessing={creating || updating}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
