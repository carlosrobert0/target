import { router } from 'expo-router'
import { View } from 'react-native'
import { Progress } from '@/components/Progress'
import { List } from '@/components/List'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { Transaction, type TransactionProps } from '@/components/Transaction'

export default function InProgress() {
  const transactions: TransactionProps[] = [
    {
      id: '1',
      type: TransactionTypes.Input,
      createdAt: '10/10/2023',
      description: 'Salário',
    },
    {
      id: '2',
      type: TransactionTypes.Output,
      createdAt: '11/10/2023',
      description: 'Conta de luz',
    },
    {
      id: '3',
      type: TransactionTypes.Output,
      createdAt: '12/10/2023',
      description: 'Supermercado',
    },
    {
      id: '4',
      type: TransactionTypes.Input,
      createdAt: '13/10/2023',
      description: 'Freela',
    },
    {
      id: '5',
      type: TransactionTypes.Output,
      createdAt: '14/10/2023',
      description: 'Transporte',
    },
    {
      id: '6',
      type: TransactionTypes.Input,
      createdAt: '15/10/2023',
      description: 'Venda de item',
    },
    {
      id: '7',
      type: TransactionTypes.Output,
      createdAt: '16/10/2023',
      description: 'Lazer',
    },
    {
      id: '8',
      type: TransactionTypes.Input,
      createdAt: '17/10/2023',
      description: 'Bônus',
    },
    {
      id: '9',
      type: TransactionTypes.Output,
      createdAt: '18/10/2023',
      description: 'Assinatura de serviço',
    },
    {
      id: '10',
      type: TransactionTypes.Input,
      createdAt: '19/10/2023',
      description: 'Renda extra',
    },
  ]

  return (
    <View className="size-full p-6 pt-0 gap-8">
      <PageHeader
        title="Apple Watch"
        rightButton={{
          icon: 'edit',
          onPress: () => router.push('/target/1'),
        }}
      />

      <Progress />

      <View className="justify-between flex-1">
        <List
          title="Transações"
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Transaction data={item} />}
          emptyMessage="Nenhuma transação cadastrada"
        />

        <Button title="Nova transação" onPress={() => router.push('/transaction/Input')} />
      </View>
    </View>
  )
}
