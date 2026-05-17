import type { Summary, TransactionCreate, TransactionResponse } from '@/@types/transaction'
import { useSQLiteContext } from 'expo-sqlite'

export function useTransactionDatabase() {
  const database = useSQLiteContext()

  async function create(data: TransactionCreate): Promise<number> {
    const statement = await database.prepareAsync(`
      INSERT INTO transactions
        (target_id, amount, observation, category, wallet_id, receipt_uri, occurred_at)
      VALUES
        ($target_id, $amount, $observation, $category, $wallet_id, $receipt_uri,
         COALESCE($occurred_at, CURRENT_TIMESTAMP))
    `)
    const result = await statement.executeAsync({
      $amount: data.amount,
      $target_id: data.target_id,
      $observation: data.observation,
      $category: data.category || null,
      $wallet_id: data.wallet_id ?? null,
      $receipt_uri: data.receipt_uri ?? null,
      $occurred_at: data.occurred_at ?? null,
    })
    return result.lastInsertRowId
  }

  async function update(id: number, data: Partial<TransactionCreate>) {
    const statement = await database.prepareAsync(`
      UPDATE transactions SET
        amount      = COALESCE($amount, amount),
        observation = COALESCE($observation, observation),
        category    = COALESCE($category, category),
        wallet_id   = COALESCE($wallet_id, wallet_id),
        receipt_uri = $receipt_uri,
        occurred_at = COALESCE($occurred_at, occurred_at),
        updated_at  = CURRENT_TIMESTAMP
      WHERE id = $id
    `)
    await statement.executeAsync({
      $id: id,
      $amount: data.amount ?? null,
      $observation: data.observation ?? null,
      $category: data.category ?? null,
      $wallet_id: data.wallet_id ?? null,
      $receipt_uri: data.receipt_uri ?? null,
      $occurred_at: data.occurred_at ?? null,
    })
  }

  async function show(id: number) {
    return database.getFirstAsync<TransactionResponse & {
      target_id: number
      wallet_id: number | null
      occurred_at: string
    }>(
      `SELECT
         id, target_id, amount, observation, category,
         wallet_id, receipt_uri, occurred_at
       FROM transactions WHERE id = ?`,
      [id],
    )
  }

  async function listTransactionsByTargetId(id: number) {
    try {
      const transactions = await database.getAllAsync<TransactionResponse>(
        `SELECT
           id, target_id, amount, observation, category,
           wallet_id, receipt_uri,
           occurred_at AS occurredAt,
           created_at  AS createdAt
         FROM transactions
         WHERE target_id = ?
         ORDER BY occurredAt DESC`,
        [id],
      )
      return transactions
    } catch (err) {
      console.error('ERRO no getAllAsync:', err)
      return []
    }
  }

  async function remove(id: number) {
    const statement = await database.prepareAsync(`DELETE FROM transactions WHERE id = $id`)
    await statement.executeAsync({ $id: id })
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

  async function countAll(): Promise<number> {
    const row = await database.getFirstAsync<{ n: number }>(
      `SELECT COUNT(*) AS n FROM transactions`,
    )
    return row?.n ?? 0
  }

  async function distinctDayCount(): Promise<number> {
    const row = await database.getFirstAsync<{ n: number }>(
      `SELECT COUNT(DISTINCT DATE(occurred_at)) AS n FROM transactions`,
    )
    return row?.n ?? 0
  }

  return {
    create,
    update,
    show,
    remove,
    summary,
    summaryByCategory,
    listTransactionsByTargetId,
    countAll,
    distinctDayCount,
  }
}
