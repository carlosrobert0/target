import { PageHeader } from '@/components/PageHeader'
import { View } from 'react-native'
import { TransactionType } from '@/components/TransactionType'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { CurrencyInput } from '@/components/CurrencyInput'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { useState } from 'react'

export default function Transaction() {
  const [type, setType] = useState(TransactionTypes.Input)
  return (
    <View className="flex-1 p-6 gap-8">
      <PageHeader
        title="Nova transação"
        subtitle="A cada valor guardado você fica mais próximo da sua meta. Se esforce para guardar e evitar retirar."
      />

      <View className="mt-8 gap-6">
        <TransactionType selected={type} onChange={setType} />

        <CurrencyInput label="Valor (R$)" placeholder="50,00" value={null} />

        <Input label="Motivo" placeholder="Ex: Investir em CDB de 110% no banco XPTO" />

        <Button title="Salvar" className="mx-0" />
      </View>
    </View>
  )
}
