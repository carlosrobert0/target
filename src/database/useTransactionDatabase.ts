import type { Summary, TransactionCreate, TransactionResponse } from '@/@types/transaction'
import { useSQLiteContext } from 'expo-sqlite'

export function useTransactionDatabase() {
  const database = useSQLiteContext()

  async function create(data: TransactionCreate) {
    const statement = await database.prepareAsync(`
      INSERT INTO transactions (target_id, amount, observation)
      VALUES ($target_id, $amount, $observation)
    `)

    await statement.executeAsync({
      $amount: data.amount,
      $target_id: data.target_id,
      $observation: data.observation,
    })
  }

  async function listTransactionsByTargetId(id: number) {
    try {
      const transactions = await database.getAllAsync<TransactionResponse>(`
        SELECT id, target_id, amount, observation, created_at AS createdAt FROM transactions WHERE target_id = ${id}
        ORDER BY createdAt DESC
      `)

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

  async function summary() {
    return await database.getFirstAsync<Summary>(`
      SELECT
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS input,
        COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS output
      FROM transactions
    `)
  }

  return {
    create,
    remove,
    summary,
    listTransactionsByTargetId,
    dropTable,
  }
}
