import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StatusBar, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'

import { PageHeader } from '@/components/PageHeader'
import { TransactionForm, type TransactionFormValues } from '@/components/TransactionForm'
import { TransactionTypes } from '@/utils/TransactionTypes'
import { useTransactionDatabase } from '@/database/useTransactionDatabase'
import { useTagDatabase } from '@/database/useTagDatabase'
import { useUpdateTransaction } from '@/hooks/services/transactions/useUpdateTransaction'
import { colors } from '@/theme/colors'

export default function EditTransaction() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const numericId = Number(id)
  const { show } = useTransactionDatabase()
  const { tagsForTransaction } = useTagDatabase()
  const { mutate, isPending } = useUpdateTransaction()

  const [initial, setInitial] = useState<Partial<TransactionFormValues> | null>(null)

  useEffect(() => {
    async function load() {
      const tx = await show(numericId)
      if (!tx) return
      const tags = await tagsForTransaction(numericId)
      const isOutput = tx.amount < 0
      setInitial({
        type: isOutput ? TransactionTypes.Output : TransactionTypes.Input,
        amount: Math.abs(tx.amount),
        observation: tx.observation ?? '',
        category: tx.category ?? '',
        walletId: tx.wallet_id,
        receiptUri: tx.receipt_uri ?? null,
        tagIds: tags.map((t) => t.id),
        occurredAt: new Date(tx.occurred_at),
      })
    }
    load()
  }, [numericId])

  function handleSave(values: TransactionFormValues) {
    const signed =
      values.type === TransactionTypes.Output ? -Math.abs(values.amount) : values.amount
    mutate({
      id: numericId,
      data: {
        amount: signed,
        observation: values.observation,
        category: values.type === TransactionTypes.Output ? values.category : '',
        wallet_id: values.walletId ?? undefined,
        receipt_uri: values.receiptUri,
        occurred_at: values.occurredAt.toISOString(),
      },
      tagIds: values.tagIds,
    })
  }

  if (!initial) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.blue[500]} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 px-6 bg-background dark:bg-gray-900" edges={['top']}>
      <StatusBar barStyle="dark-content" translucent />
      <PageHeader title="Editar transação" subtitle="Ajuste os campos e salve." />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mt-8"
        contentContainerStyle={{ paddingBottom: 32 }}>
        <TransactionForm
          initial={initial}
          submitting={isPending}
          submitLabel="Salvar alterações"
          onSubmit={handleSave}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
