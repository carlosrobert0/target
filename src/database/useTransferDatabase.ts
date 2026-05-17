import type { Transfer, TransferCreate, TransferWithWallets } from '@/@types/transfer'
import { useSQLiteContext } from 'expo-sqlite'

export function useTransferDatabase() {
  const database = useSQLiteContext()

  async function create(data: TransferCreate): Promise<number> {
    const statement = await database.prepareAsync(`
      INSERT INTO transfers
        (from_wallet_id, to_wallet_id, amount, observation, occurred_at)
      VALUES
        ($from, $to, $amount, $obs, COALESCE($occurred_at, CURRENT_TIMESTAMP))
    `)
    const result = await statement.executeAsync({
      $from: data.from_wallet_id,
      $to: data.to_wallet_id,
      $amount: Math.abs(data.amount),
      $obs: data.observation ?? null,
      $occurred_at: data.occurred_at ?? null,
    })
    return result.lastInsertRowId
  }

  async function remove(id: number) {
    const statement = await database.prepareAsync(`DELETE FROM transfers WHERE id = $id`)
    await statement.executeAsync({ $id: id })
  }

  async function list() {
    return database.getAllAsync<TransferWithWallets>(`
      SELECT
        tr.*,
        wf.name  AS from_wallet_name,
        wf.color AS from_wallet_color,
        wt.name  AS to_wallet_name,
        wt.color AS to_wallet_color
      FROM transfers tr
      INNER JOIN wallets wf ON wf.id = tr.from_wallet_id
      INNER JOIN wallets wt ON wt.id = tr.to_wallet_id
      ORDER BY tr.occurred_at DESC
    `)
  }

  async function show(id: number) {
    return database.getFirstAsync<Transfer>(`SELECT * FROM transfers WHERE id = ?`, [id])
  }

  return { create, remove, list, show }
}
