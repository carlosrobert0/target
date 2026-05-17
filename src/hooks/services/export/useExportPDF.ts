import { useSQLiteContext } from 'expo-sqlite'
import { useMutation } from '@tanstack/react-query'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Alert } from 'react-native'
import { useAnalysisCategoriesDatabase } from '@/database/useAnalysisCategoriesDatabase'
import { buildMonthlyReportHTML, type MonthlyReportData } from '@/lib/export/pdf'

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function useExportPDF() {
  const database = useSQLiteContext()
  const { load: loadAnalysis } = useAnalysisCategoriesDatabase()

  return useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      const start = new Date(year, month, 1).toISOString()
      const end = new Date(year, month + 1, 1).toISOString()

      const totals = await database.getFirstAsync<{ income: number; expense: number }>(
        `SELECT
           COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS income,
           COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS expense
         FROM transactions
         WHERE occurred_at >= ? AND occurred_at < ?`,
        [start, end],
      )

      const byCategory = await database.getAllAsync<{ category: string; total: number }>(
        `SELECT COALESCE(category, 'Sem categoria') AS category, SUM(ABS(amount)) AS total
         FROM transactions
         WHERE amount < 0 AND occurred_at >= ? AND occurred_at < ?
         GROUP BY category
         ORDER BY total DESC`,
        [start, end],
      )

      const transactions = await database.getAllAsync<{
        date: string
        target_name: string
        amount: number
        category: string | null
        observation: string | null
      }>(
        `SELECT
           t.occurred_at AS date,
           tg.name AS target_name,
           t.amount,
           t.category,
           t.observation
         FROM transactions t
         INNER JOIN targets tg ON tg.id = t.target_id
         WHERE t.occurred_at >= ? AND t.occurred_at < ?
         ORDER BY t.occurred_at DESC`,
        [start, end],
      )

      const analysis = await loadAnalysis()
      const totalIncome = totals?.income ?? 0
      const byBucket = analysis
        ? Object.values(analysis).map((bucket) => {
            const allocated = (totalIncome * bucket.percentage) / 100
            const spent = byCategory
              .filter((c) => bucket.categories.includes(c.category as any))
              .reduce((sum, c) => sum + c.total, 0)
            return {
              name: bucket.name,
              allocated,
              spent,
              percentage: bucket.percentage,
            }
          })
        : []

      const reportData: MonthlyReportData = {
        monthLabel: `${MONTH_LABELS[month]} de ${year}`,
        totalIncome,
        totalExpense: totals?.expense ?? 0,
        net: (totals?.income ?? 0) + (totals?.expense ?? 0),
        byCategory: byCategory.map((c) => ({ category: c.category, total: c.total })),
        byBucket,
        transactions: transactions.map((t) => ({
          ...t,
          date: new Date(t.date).toLocaleDateString('pt-BR'),
        })),
      }

      const html = buildMonthlyReportHTML(reportData)
      const { uri } = await Print.printToFileAsync({ html })
      const filename = `cofrin-relatorio-${year}-${String(month + 1).padStart(2, '0')}.pdf`

      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: filename,
        })
      }

      return { uri, count: transactions.length }
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.')
      console.log(error)
    },
  })
}
