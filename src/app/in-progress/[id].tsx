import { router, useLocalSearchParams } from 'expo-router'
import { Alert, View } from 'react-native'
import { Progress } from '@/components/Progress'
import { List } from '@/components/List'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'
import { Transaction } from '@/components/Transaction'
import { useGetTargetById } from '@/hooks/services/targets/useGetTargetById'
import { useListTransactionsByTargetId } from '@/hooks/services/transactions/useListTransactionsByTargetId'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { useRemoveTransactionById } from '@/hooks/services/transactions/useRemoveTransactionById'

export default function InProgress() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data } = useGetTargetById(Number(id))
  const { data: transactions } = useListTransactionsByTargetId(Number(id))
  const { mutate: removeTransaction } = useRemoveTransactionById()

  async function handleRemoveTransaction(id: number) {
    Alert.alert('Remover transação', 'Tem certeza que deseja remover essa transação?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Remover',
        onPress: () => {
          removeTransaction(id, {
            onSuccess: () => {
              router.replace(`/in-progress/${data?.id}`)
            },
          })
        },
      },
    ])
  }

  const details = {
    current: numberToCurrency(data?.current),
    target: numberToCurrency(data?.amount),
    percentage: data?.percentage.toFixed(0).concat('%') || '0%',
  }

  return (
    <View className="size-full p-6 pt-0 gap-8">
      <PageHeader
        title={data?.name}
        rightButton={{
          icon: 'edit',
          onPress: () => router.push(`/target/${data?.id}`),
        }}
      />

      <Progress data={details} />

      <View className="justify-between flex-1">
        <List
          title="Transações"
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Transaction data={item} onRemove={() => handleRemoveTransaction(Number(item.id))} />
          )}
          emptyMessage="Nenhuma transação cadastrada"
        />

        <Button title="Nova transação" onPress={() => router.push(`/transaction/${data.id}`)} />
      </View>
    </View>
  )
}
