import { Button } from '@/components/Button'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Input } from '@/components/Input'
import { PageHeader } from '@/components/PageHeader'
import { Alert, View } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { useTargetDatabase, type TargetCreate } from '@/database/useTargetDatabase'
import { router } from 'expo-router'

export default function Target() {
  function handleSave(data: TargetCreate) {
    createTarget(data)
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm()

  const { create } = useTargetDatabase()

  async function createTarget({ name, amount }: TargetCreate) {
    try {
      await create({ name, amount })

      Alert.alert('Nova Meta', 'Meta criada com sucesso!', [
        {
          text: 'Ok',
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a meta.')
      console.log(error)
    }
  }

  return (
    <View className="size-full px-6 gap-8">
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
    </View>
  )
}
