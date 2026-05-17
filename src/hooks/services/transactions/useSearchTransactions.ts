import { useSQLiteContext } from 'expo-sqlite'
import { useQuery } from '@tanstack/react-query'

export type SearchFilters = {
  text?: string
  category?: string
  targetId?: number
  tagIds?: number[]
  fromDate?: string
  toDate?: string
  type?: 'income' | 'expense' | 'all'
}

export type SearchResultRow = {
  id: number
  amount: number
  observation: string | null
  category: string | null
  target_id: number
  target_name: string
  occurred_at: string
}

export function useSearchTransactions(filters: SearchFilters) {
  const database = useSQLiteContext()

  return useQuery({
    queryKey: ['search', filters],
    queryFn: async () => {
      const conditions: string[] = []
      const params: any[] = []

      if (filters.text && filters.text.trim().length > 0) {
        conditions.push('(t.observation LIKE ? OR tg.name LIKE ?)')
        const like = `%${filters.text.trim()}%`
        params.push(like, like)
      }
      if (filters.category) {
        conditions.push('t.category = ?')
        params.push(filters.category)
      }
      if (filters.targetId) {
        conditions.push('t.target_id = ?')
        params.push(filters.targetId)
      }
      if (filters.fromDate) {
        conditions.push('t.occurred_at >= ?')
        params.push(filters.fromDate)
      }
      if (filters.toDate) {
        conditions.push('t.occurred_at <= ?')
        params.push(filters.toDate)
      }
      if (filters.type === 'income') conditions.push('t.amount > 0')
      if (filters.type === 'expense') conditions.push('t.amount < 0')

      let tagJoin = ''
      if (filters.tagIds && filters.tagIds.length > 0) {
        tagJoin = `INNER JOIN transaction_tags tt ON tt.transaction_id = t.id`
        const placeholders = filters.tagIds.map(() => '?').join(',')
        conditions.push(`tt.tag_id IN (${placeholders})`)
        params.push(...filters.tagIds)
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
      const groupBy = tagJoin ? 'GROUP BY t.id' : ''

      const rows = await database.getAllAsync<SearchResultRow>(
        `SELECT
           t.id, t.amount, t.observation, t.category,
           t.target_id, tg.name AS target_name, t.occurred_at
         FROM transactions t
         INNER JOIN targets tg ON tg.id = t.target_id
         ${tagJoin}
         ${where}
         ${groupBy}
         ORDER BY t.occurred_at DESC
         LIMIT 200`,
        params,
      )
      return rows
    },
  })
}
