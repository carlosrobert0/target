import { PageHeader } from '@/components/PageHeader'
import { View } from 'react-native'
import { TransactionType } from '@/components/TransactionType'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { CurrencyInput } from '@/components/CurrencyInput'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { useForm, Controller } from 'react-hook-form'
import type { TransactionCreate } from '@/@types/transaction'
import { useLocalSearchParams } from 'expo-router'
import { useCreateTransaction } from '@/hooks/services/transactions/useCreateTransaction'

export default function Transaction() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      target_id: Number(id),
      amount: 0,
      observation: '',
      type: TransactionTypes.Input,
    },
  })

  const type = watch('type')

  const { mutate } = useCreateTransaction()

  function handleSave(data: TransactionCreate) {
    mutate({
      target_id: Number(id),
      amount: type === TransactionTypes.Output ? data.amount * -1 : data.amount,
      observation: data.observation,
    })
  }

  return (
    <View className="flex-1 px-6 gap-8">
      <PageHeader
        title="Nova transação"
        subtitle="A cada valor guardado você fica mais próximo da sua meta. Se esforce para guardar e evitar retirar."
      />

      <View className="mt-8 gap-6">
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

        <Button
          title="Salvar"
          className="mx-0"
          onPress={handleSubmit(handleSave)}
          isProcessing={isSubmitting}
        />
      </View>
    </View>
  )
}
