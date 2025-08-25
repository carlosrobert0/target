import { PageHeader } from '@/components/PageHeader'
import { View } from 'react-native'
import { TransactionType } from '@/components/TransactionType'
import { TransactionTypeEnum } from '@/components/Transaction'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { CurrencyInput } from '@/components/CurrencyInput'

export default function Transaction() {
  return (
    <View className="flex-1 p-6 gap-8 pt-16">
      <PageHeader
        title="Nova transação"
        subtitle="A cada valor guardado você fica mais próximo da sua meta. Se esforce para guardar e evitar retirar."
      />

      <View className="flex-row bg-gray-100">
        <TransactionType type={TransactionTypeEnum.INCOME} title="Guardar" />
        <TransactionType type={TransactionTypeEnum.OUTCOME} title="Resgatar" />
      </View>

      <CurrencyInput label="Valor (R$)" placeholder="50,00" value={0} />

      <Input label="Motivo" placeholder="Ex: Investir em CDB de 110% no banco XPTO" />

      <Button title="Salvar" className="mx-0" />
    </View>
  )
}
