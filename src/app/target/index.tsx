import { Button } from '@/components/Button'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Input } from '@/components/Input'
import { PageHeader } from '@/components/PageHeader'
import { View } from 'react-native'

export default function Target() {
  return (
    <View className="size-full p-6 gap-8">
      <PageHeader title="" subtitle="Economize para alcançar sua meta financeira." />

      <Input label="Nome da meta" placeholder="Ex: Viagem para a praia, Apple Watch" />

      <CurrencyInput label="Valor alvo (R$)" placeholder="0,00" value={null} />

      <Button title="Salvar" className="mx-0" />
    </View>
  )
}
