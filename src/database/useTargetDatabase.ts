import type { TargetCreate, TargetResponse } from '@/@types/target'
import { useSQLiteContext } from 'expo-sqlite'

export function useTargetDatabase() {
  const database = useSQLiteContext()

  async function create(data: TargetCreate) {
    const statement = await database.prepareAsync(
      `INSERT INTO targets (name, amount, target_date)
       VALUES ($name, $amount, $target_date)`,
    )
    await statement.executeAsync({
      $name: data.name,
      $amount: data.amount,
      $target_date: data.target_date ?? null,
    })
  }

  async function update(id: number, data: Partial<TargetCreate>) {
    const statement = await database.prepareAsync(`
      UPDATE targets
        SET
          name        = COALESCE($name, name),
          amount      = COALESCE($amount, amount),
          target_date = $target_date,
          updated_at  = CURRENT_TIMESTAMP
        WHERE id = $id
    `)
    await statement.executeAsync({
      $id: id,
      $name: data.name ?? null,
      $amount: data.amount ?? null,
      $target_date: data.target_date ?? null,
    })
  }

  async function remove(id: number) {
    const statement = await database.prepareAsync(`DELETE FROM targets WHERE id = $id`)
    await statement.executeAsync({ $id: id })
  }

  async function removeAll() {
    try {
      await database.execAsync('DELETE FROM targets')
    } catch (error) {
      console.error('Erro ao deletar todos os registros:', error)
    }
  }

  async function listByClosestTarget() {
    return database.getAllAsync<TargetResponse>(`
      SELECT
        targets.id,
        targets.name,
        targets.amount,
        targets.target_date,
        COALESCE(SUM(transactions.amount), 0) AS current,
        COALESCE((SUM((transactions.amount) / targets.amount)) * 100, 0) AS percentage
      FROM targets
      LEFT JOIN transactions ON targets.id = transactions.target_id
      WHERE targets.archived_at IS NULL
      GROUP BY targets.id, targets.name, targets.amount, targets.target_date
      ORDER BY percentage DESC
    `)
  }

  async function show(id: number) {
    const result = await database.getAllAsync<TargetResponse>(
      `
      SELECT
        targets.id,
        targets.name,
        targets.amount,
        targets.target_date,
        COALESCE(SUM(transactions.amount), 0) AS current,
        COALESCE((SUM((transactions.amount) / targets.amount)) * 100, 0) AS percentage
      FROM targets
      LEFT JOIN transactions ON targets.id = transactions.target_id
      WHERE targets.id = ?
        AND targets.archived_at IS NULL
      GROUP BY targets.id, targets.name, targets.amount, targets.target_date
    `,
      [id],
    )

    return result[0]
  }

  return {
    create,
    show,
    update,
    remove,
    removeAll,
    listByClosestTarget,
  }
}
