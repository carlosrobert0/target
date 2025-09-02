import { Button } from '@/components/Button'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Input } from '@/components/Input'
import { PageHeader } from '@/components/PageHeader'
import { StatusBar, View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import type { TargetCreate } from '@/@types/target'
import { useCreateTarget } from '@/hooks/services/targets/useCreateTarget'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Target() {
  const { mutate } = useCreateTarget()
  function handleSave(data: TargetCreate) {
    mutate(data)
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm()

  return (
    <SafeAreaView className="size-full px-6 gap-8" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader title="" subtitle="Economize para alcançar sua meta financeira." />

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

      <Button
        title="Salvar"
        className="mx-0"
        onPress={handleSubmit(handleSave)}
        isProcessing={isSubmitting}
      />
    </SafeAreaView>
  )
}
