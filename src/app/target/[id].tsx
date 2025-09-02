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
import { Alert, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function TargetEditing() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data } = useGetTargetById(Number(id))
  const { mutate: remove } = useRemoveTargetById(Number(id))
  const { mutate: update } = useUpdateTargetById(Number(id))

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: data?.name,
      amount: data?.amount,
    },
  })

  const handleDeleteConfirm = () => {
    Alert.alert('Deletar meta', 'Tem certeza que deseja deletar essa meta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: () => remove() },
    ])
  }

  const onSubmit = (data: TargetCreate) => {
    update(data)
  }

  return (
    <SafeAreaView className="size-full px-6 gap-8" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader
        title="Meta"
        subtitle="Economize para alcançar sua meta financeira."
        rightButton={{
          icon: 'delete',
          onPress: handleDeleteConfirm,
        }}
      />

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
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            label="Valor alvo (R$)"
            placeholder="0,00"
          />
        )}
      />

      <Button title="Salvar" className="mx-0" onPress={handleSubmit(onSubmit)} />
    </SafeAreaView>
  )
}
