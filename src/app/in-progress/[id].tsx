import { router, useLocalSearchParams } from 'expo-router'
import { Alert, StatusBar, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Progress } from '@/components/Progress'
import { List } from '@/components/List'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'
import { Transaction } from '@/components/Transaction'
import { useGetTargetById } from '@/hooks/services/targets/useGetTargetById'
import { useListTransactionsByTargetId } from '@/hooks/services/transactions/useListTransactionsByTargetId'
import { useRemoveTransactionById } from '@/hooks/services/transactions/useRemoveTransactionById'
import { numberToCurrency } from '@/utils/numberToCurrency'
import { deadlineInfo } from '@/utils/targetMath'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Loading } from '@/components/Loading'
import { colors } from '@/theme/colors'

export default function InProgress() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data } = useGetTargetById(Number(id))
  const { data: transactions, isLoading } = useListTransactionsByTargetId(Number(id))
  const { mutate: removeTransaction } = useRemoveTransactionById()

  async function handleRemoveTransaction(id: number) {
    Alert.alert('Remover transação', 'Tem certeza que deseja remover essa transação?', [
      { text: 'Cancelar', style: 'cancel' },
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

  const info = data?.target_date
    ? deadlineInfo(data.target_date as unknown as string, data.current, data.amount)
    : null

  if (isLoading) {
    return <Loading />
  }

  return (
    <SafeAreaView
      className="size-full p-6 pt-0 gap-8 bg-background dark:bg-gray-900"
      edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader
        title={data?.name}
        rightButton={{
          icon: 'edit',
          onPress: () => router.push(`/target/${data?.id}`),
        }}
      />

      <Progress data={details} />

      {info && data && data.percentage < 100 && (
        <View
          className={`rounded-2xl p-3 ${
            info.isOverdue ? 'bg-red-50 dark:bg-red-900/30' : 'bg-blue-50 dark:bg-blue-900/30'
          }`}>
          <View className="flex-row items-center gap-2">
            <Feather
              name={info.isOverdue ? 'alert-circle' : 'calendar'}
              size={16}
              color={info.isOverdue ? colors.red[400] : colors.blue[500]}
            />
            <Text className="font-inter font-bold text-sm text-black dark:text-white">
              {info.isOverdue
                ? `Prazo passou em ${info.deadlineLabel}`
                : `Prazo: ${info.deadlineLabel}`}
            </Text>
          </View>
          {!info.isOverdue && (
            <Text className="font-inter text-xs text-gray-600 dark:text-gray-400 mt-1">
              Faltam {info.monthsRemaining} {info.monthsRemaining === 1 ? 'mês' : 'meses'} —
              guarde {info.monthlyContributionLabel}/mês pra atingir a meta.
            </Text>
          )}
        </View>
      )}

      <View className="justify-between flex-1">
        <List
          title="Transações"
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Transaction
              data={item}
              onRemove={() => handleRemoveTransaction(Number(item.id))}
              onPress={() => router.push(`/transaction/edit/${item.id}`)}
            />
          )}
          emptyMessage="Nenhuma transação cadastrada"
        />

        <Button title="Nova transação" onPress={() => router.push(`/transaction/${data.id}`)} />
      </View>
    </SafeAreaView>
  )
}
