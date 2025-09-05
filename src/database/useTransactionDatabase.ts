import type { Summary, TransactionCreate, TransactionResponse } from '@/@types/transaction'
import { useSQLiteContext } from 'expo-sqlite'

export function useTransactionDatabase() {
  const database = useSQLiteContext()

  async function create(data: TransactionCreate) {
    const statement = await database.prepareAsync(`
      INSERT INTO transactions (target_id, amount, observation, category)
      VALUES ($target_id, $amount, $observation, $category)
    `)

    await statement.executeAsync({
      $amount: data.amount,
      $target_id: data.target_id,
      $observation: data.observation,
      $category: data.category || null,
    })
  }

  async function listTransactionsByTargetId(id: number) {
    try {
      const transactions = await database.getAllAsync<TransactionResponse>(
        `
          SELECT id, target_id, amount, observation, category, created_at AS createdAt
          FROM transactions
          WHERE target_id = ?
          ORDER BY createdAt DESC
        `,
        [id],
      )

      return transactions
    } catch (err) {
      console.error('ERRO no getAllAsync:', err)
      return []
    }
  }

  async function remove(id: number) {
    const statement = await database.prepareAsync(`
      DELETE FROM transactions WHERE id = $id
    `)

    await statement.executeAsync({
      $id: id,
    })
  }

  async function dropTable() {
    const statement = await database.prepareAsync(`
      DROP TABLE IF EXISTS transactions
    `)
    await statement.executeAsync()
  }

  async function migrate() {
    await database.execAsync(`
      ALTER TABLE transactions ADD COLUMN category TEXT;
    `)
  }

  async function summary() {
    return await database.getFirstAsync<Summary>(`
      SELECT
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS input,
        COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS output
      FROM transactions
    `)
  }

  async function summaryByCategory() {
    try {
      const result = await database.getAllAsync<{ category: string; total: number }>(`
        SELECT 
          COALESCE(category, 'Sem categoria') as category,
          SUM(amount) as total
        FROM transactions 
        WHERE amount < 0 
        GROUP BY category 
        ORDER BY total ASC
      `)
      return result
    } catch (err) {
      console.error('Erro ao buscar resumo por categoria:', err)
      return []
    }
  }

  return {
    create,
    remove,
    summary,
    summaryByCategory,
    listTransactionsByTargetId,
    dropTable,
    migrate,
  }
}
