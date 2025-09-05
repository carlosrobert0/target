import type { TargetCreate, TargetResponse } from '@/@types/target'
import { useSQLiteContext } from 'expo-sqlite'

export function useTargetDatabase() {
  const database = useSQLiteContext()

  async function create(data: TargetCreate) {
    const statement = await database.prepareAsync(
      'INSERT INTO targets (name, amount) VALUES ($name, $amount)',
    )

    statement.executeAsync({
      $name: data.name,
      $amount: data.amount,
    })
  }

  async function update(id: number, data: Partial<TargetCreate>) {
    const statement = await database.prepareAsync(`
      UPDATE targets 
        SET 
          name = COALESCE($name, name),
          amount = COALESCE($amount, amount),
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = $id
    `)

    await statement.executeAsync({
      $id: id,
      $name: data.name,
      $amount: data.amount,
    })
  }

  async function remove(id: number) {
    const statement = await database.prepareAsync(`
      DELETE FROM targets WHERE id = $id
    `)

    await statement.executeAsync({
      $id: id,
    })
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
        COALESCE(SUM(transactions.amount), 0) AS current,
        COALESCE((SUM((transactions.amount) / targets.amount)) * 100, 0) AS percentage
      FROM targets
      LEFT JOIN transactions ON targets.id = transactions.target_id
      GROUP BY targets.id, targets.name, targets.amount
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
        COALESCE(SUM(transactions.amount), 0) AS current,
        COALESCE((SUM((transactions.amount) / targets.amount)) * 100, 0) AS percentage
      FROM targets
      LEFT JOIN transactions ON targets.id = transactions.target_id
      WHERE targets.id = ?
      GROUP BY targets.id, targets.name, targets.amount
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
