import { useSQLiteContext } from 'expo-sqlite'
import { useMutation } from '@tanstack/react-query'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Alert } from 'react-native'
import { transactionsToCSV, type CsvTransactionRow } from '@/lib/export/csv'

export type ExportCsvFilters = {
  fromDate?: string
  toDate?: string
  targetId?: number
}

export function useExportCSV() {
  const database = useSQLiteContext()

  return useMutation({
    mutationFn: async (filters: ExportCsvFilters) => {
      const conditions: string[] = []
      const params: any[] = []

      if (filters.fromDate) {
        conditions.push('t.occurred_at >= ?')
        params.push(filters.fromDate)
      }
      if (filters.toDate) {
        conditions.push('t.occurred_at <= ?')
        params.push(filters.toDate)
      }
      if (filters.targetId) {
        conditions.push('t.target_id = ?')
        params.push(filters.targetId)
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
      const rows = await database.getAllAsync<CsvTransactionRow>(
        `SELECT
           t.id,
           t.occurred_at AS date,
           t.target_id,
           tg.name AS target_name,
           t.amount,
           t.category,
           t.observation
         FROM transactions t
         INNER JOIN targets tg ON tg.id = t.target_id
         ${where}
         ORDER BY t.occurred_at DESC`,
        params,
      )

      const csv = transactionsToCSV(rows)
      const filename = `cofrin-${new Date().toISOString().slice(0, 10)}.csv`
      const uri = `${FileSystem.cacheDirectory}${filename}`
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 })

      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar CSV' })
      }

      return { uri, count: rows.length }
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível exportar.')
      console.log(error)
    },
  })
}
