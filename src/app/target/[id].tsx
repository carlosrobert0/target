import { useEffect, useState } from 'react'
import type { TargetCreate } from '@/@types/target'
import { Button } from '@/components/Button'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Input } from '@/components/Input'
import { PageHeader } from '@/components/PageHeader'
import { useGetTargetById } from '@/hooks/services/targets/useGetTargetById'
import { useRemoveTargetById } from '@/hooks/services/targets/useRemoveTargetById'
import { useUpdateTargetById } from '@/hooks/services/targets/useUpdateTargetById'
import { useLocalSearchParams } from 'expo-router/build/hooks'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { colors } from '@/theme/colors'

export default function TargetEditing() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data } = useGetTargetById(Number(id))
  const { mutate: remove } = useRemoveTargetById(Number(id))
  const { mutate: update } = useUpdateTargetById(Number(id))

  const [deadline, setDeadline] = useState<Date | null>(null)
  const [showDate, setShowDate] = useState(false)

  const { control, handleSubmit, reset } = useForm<{ name: string; amount: number }>({
    defaultValues: { name: '', amount: 0 },
  })

  useEffect(() => {
    if (data) {
      reset({ name: data.name, amount: data.amount })
      setDeadline(data.target_date ? new Date(data.target_date) : null)
    }
  }, [data, reset])

  function handleDateChange(_: DateTimePickerEvent, picked?: Date) {
    if (Platform.OS === 'android') setShowDate(false)
    if (picked) setDeadline(picked)
  }

  const handleDeleteConfirm = () => {
    Alert.alert('Deletar meta', 'Tem certeza que deseja deletar essa meta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: () => remove() },
    ])
  }

  const onSubmit = (values: { name: string; amount: number }) => {
    const payload: TargetCreate = {
      name: values.name,
      amount: values.amount,
      target_date: deadline?.toISOString() ?? null,
    }
    update(payload)
  }

  return (
    <SafeAreaView
      className="size-full px-6 bg-background dark:bg-gray-900"
      edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader
        title="Meta"
        subtitle="Economize para alcançar sua meta financeira."
        rightButton={{
          icon: 'delete',
          onPress: handleDeleteConfirm,
        }}
      />

      <ScrollView contentContainerStyle={{ gap: 24, paddingTop: 24, paddingBottom: 32 }}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              label="Nome da meta"
              placeholder="Ex: Viagem para a praia, Apple Watch"
            />
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <CurrencyInput
              onChangeValue={onChange}
              onBlur={onBlur}
              value={value}
              label="Valor alvo (R$)"
              placeholder="0,00"
            />
          )}
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

        <Button title="Salvar" className="mx-0" onPress={handleSubmit(onSubmit)} />
      </ScrollView>
    </SafeAreaView>
  )
}
