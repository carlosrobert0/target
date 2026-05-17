import { PageHeader } from '@/components/PageHeader'
import { StatusBar, ScrollView } from 'react-native'
import { TransactionForm, type TransactionFormValues } from '@/components/TransactionForm'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { useLocalSearchParams } from 'expo-router'
import { useCreateTransaction } from '@/hooks/services/transactions/useCreateTransaction'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NewTransaction() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { mutate, isPending } = useCreateTransaction()

  function handleSave(values: TransactionFormValues) {
    const signed =
      values.type === TransactionTypes.Output ? -Math.abs(values.amount) : values.amount
    mutate({
      target_id: Number(id),
      amount: signed,
      observation: values.observation,
      category: values.type === TransactionTypes.Output ? values.category : undefined,
      wallet_id: values.walletId ?? undefined,
      receipt_uri: values.receiptUri,
      occurred_at: values.occurredAt.toISOString(),
      tagIds: values.tagIds,
    })
  }

  return (
    <SafeAreaView className="flex-1 px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader
        title="Nova transação"
        subtitle="A cada valor guardado você fica mais próximo da sua meta. Se esforce para guardar e evitar retirar."
      />

      <ScrollView className="mt-8" contentContainerStyle={{ paddingBottom: 32 }}>
        <TransactionForm submitting={isPending} onSubmit={handleSave} />
      </ScrollView>
    </SafeAreaView>
  )
}
