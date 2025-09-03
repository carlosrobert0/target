import { PageHeader } from '@/components/PageHeader'
import { StatusBar, View } from 'react-native'
import { TransactionType } from '@/components/TransactionType'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { CurrencyInput } from '@/components/CurrencyInput'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { TransactionCategories } from '@/utils/TransactionCategories'
import { useForm, Controller } from 'react-hook-form'
import type { TransactionCreate } from '@/@types/transaction'
import { useLocalSearchParams } from 'expo-router'
import { useCreateTransaction } from '@/hooks/services/transactions/useCreateTransaction'
import { SafeAreaView } from 'react-native-safe-area-context'

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
      category: '',
    },
  })

  const type = watch('type')

  const { mutate } = useCreateTransaction()

  // Opções do Select baseadas no enum TransactionCategories
  const categoryOptions = [
    { label: TransactionCategories.FOOD, value: TransactionCategories.FOOD, icon: 'coffee' },
    {
      label: TransactionCategories.TRANSPORT,
      value: TransactionCategories.TRANSPORT,
      icon: 'truck',
    },
    {
      label: TransactionCategories.LEISURE,
      value: TransactionCategories.LEISURE,
      icon: 'sun',
    },
    { label: TransactionCategories.HEALTH, value: TransactionCategories.HEALTH, icon: 'heart' },
    {
      label: TransactionCategories.EDUCATION,
      value: TransactionCategories.EDUCATION,
      icon: 'book',
    },
    { label: TransactionCategories.HOUSING, value: TransactionCategories.HOUSING, icon: 'home' },
    {
      label: TransactionCategories.CLOTHING,
      value: TransactionCategories.CLOTHING,
      icon: 'shopping-bag',
    },
    {
      label: TransactionCategories.ENTERTAINMENT,
      value: TransactionCategories.ENTERTAINMENT,
      icon: 'tv',
    },
    {
      label: TransactionCategories.TECHNOLOGY,
      value: TransactionCategories.TECHNOLOGY,
      icon: 'smartphone',
    },
    {
      label: TransactionCategories.OTHER,
      value: TransactionCategories.OTHER,
      icon: 'more-horizontal',
    },
  ]

  function handleSave(data: TransactionCreate) {
    mutate({
      target_id: Number(id),
      amount: type === TransactionTypes.Output ? data.amount * -1 : data.amount,
      observation: data.observation,
      category: type === TransactionTypes.Output ? data.category : undefined,
    })
  }

  return (
    <SafeAreaView className="flex-1 px-6 gap-8" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
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
          title="Salvar"
          className="mx-0"
          onPress={handleSubmit(handleSave)}
          isProcessing={isSubmitting}
        />
      </View>
    </SafeAreaView>
  )
}
