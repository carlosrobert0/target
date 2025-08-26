import { Button } from '@/components/Button'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Input } from '@/components/Input'
import { PageHeader } from '@/components/PageHeader'
import { View, Alert } from 'react-native'

export default function TargetEditing() {
  const handleDeleteConfirm = () => {
    Alert.alert('Deletar meta', 'Tem certeza que deseja deletar essa meta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: () => null },
    ])
  }

  return (
    <View className="size-full p-6 gap-8">
      <PageHeader
        title="Meta"
        subtitle="Economize para alcançar sua meta financeira."
        rightButton={{
          icon: 'delete',
          onPress: handleDeleteConfirm,
        }}
      />

      <Input
        value="Apple Watch"
        label="Nome da meta"
        placeholder="Ex: Viagem para a praia, Apple Watch"
      />

      <CurrencyInput label="Valor alvo (R$)" placeholder="0,00" value={2187.65} />

      <Button title="Salvar" className="mx-0" />
    </View>
  )
}
