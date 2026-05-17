import type { Wallet, WalletCreate, WalletWithBalance } from '@/@types/wallet'
import { useSQLiteContext } from 'expo-sqlite'

export function useWalletDatabase() {
  const database = useSQLiteContext()

  async function list() {
    return database.getAllAsync<Wallet>(
      `SELECT * FROM wallets WHERE archived_at IS NULL ORDER BY id ASC`,
    )
  }

  async function listWithBalance() {
    return database.getAllAsync<WalletWithBalance>(`
      SELECT
        w.*,
        COALESCE(tx_sum.balance, 0)
          + COALESCE(tr_in.amount, 0)
          - COALESCE(tr_out.amount, 0)              AS balance,
        COALESCE(tx_sum.transaction_count, 0)       AS transaction_count
      FROM wallets w
      LEFT JOIN (
        SELECT wallet_id,
               SUM(amount) AS balance,
               COUNT(id)   AS transaction_count
        FROM transactions
        WHERE wallet_id IS NOT NULL
        GROUP BY wallet_id
      ) tx_sum  ON tx_sum.wallet_id  = w.id
      LEFT JOIN (
        SELECT to_wallet_id AS wallet_id, SUM(amount) AS amount
        FROM transfers GROUP BY to_wallet_id
      ) tr_in   ON tr_in.wallet_id   = w.id
      LEFT JOIN (
        SELECT from_wallet_id AS wallet_id, SUM(amount) AS amount
        FROM transfers GROUP BY from_wallet_id
      ) tr_out  ON tr_out.wallet_id  = w.id
      WHERE w.archived_at IS NULL
      ORDER BY w.id ASC
    `)
  }

  async function create(data: WalletCreate) {
    const statement = await database.prepareAsync(`
      INSERT INTO wallets (name, icon, color)
      VALUES ($name, $icon, $color)
    `)
    const result = await statement.executeAsync({
      $name: data.name.trim(),
      $icon: data.icon ?? 'credit-card',
      $color: data.color ?? 'blue',
    })
    return result.lastInsertRowId
  }

  async function update(id: number, data: Partial<WalletCreate>) {
    const statement = await database.prepareAsync(`
      UPDATE wallets SET
        name  = COALESCE($name, name),
        icon  = COALESCE($icon, icon),
        color = COALESCE($color, color)
      WHERE id = $id
    `)
    await statement.executeAsync({
      $id: id,
      $name: data.name?.trim() ?? null,
      $icon: data.icon ?? null,
      $color: data.color ?? null,
    })
  }

  async function archive(id: number) {
    const statement = await database.prepareAsync(`
      UPDATE wallets SET archived_at = CURRENT_TIMESTAMP WHERE id = $id
    `)
    await statement.executeAsync({ $id: id })
  }

  async function show(id: number) {
    return database.getFirstAsync<Wallet>(`SELECT * FROM wallets WHERE id = ?`, [id])
  }

  return { list, listWithBalance, create, update, archive, show }
}
