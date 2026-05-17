import type { RecurringCreate, RecurringResponse } from '@/@types/recurring'
import { computeNextRun } from '@/utils/recurrence'
import { useSQLiteContext } from 'expo-sqlite'

export function useRecurringTransactionDatabase() {
  const database = useSQLiteContext()

  async function create(data: RecurringCreate) {
    const firstRun = computeFirstRun(data)
    const statement = await database.prepareAsync(`
      INSERT INTO recurring_transactions
        (target_id, amount, observation, category, frequency, day_of_month, day_of_week,
         start_date, next_run, end_date)
      VALUES
        ($target_id, $amount, $observation, $category, $frequency, $day_of_month, $day_of_week,
         $start_date, $next_run, $end_date)
    `)
    const result = await statement.executeAsync({
      $target_id: data.target_id,
      $amount: data.amount,
      $observation: data.observation ?? null,
      $category: data.category ?? null,
      $frequency: data.frequency,
      $day_of_month: data.day_of_month ?? null,
      $day_of_week: data.day_of_week ?? null,
      $start_date: new Date(data.start_date).toISOString(),
      $next_run: new Date(firstRun).toISOString(),
      $end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
    })
    return result.lastInsertRowId
  }

  async function update(id: number, data: Partial<RecurringCreate>) {
    const statement = await database.prepareAsync(`
      UPDATE recurring_transactions SET
        amount = COALESCE($amount, amount),
        observation = COALESCE($observation, observation),
        category = COALESCE($category, category),
        frequency = COALESCE($frequency, frequency),
        day_of_month = COALESCE($day_of_month, day_of_month),
        day_of_week = COALESCE($day_of_week, day_of_week),
        end_date = COALESCE($end_date, end_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $id
    `)
    await statement.executeAsync({
      $id: id,
      $amount: data.amount ?? null,
      $observation: data.observation ?? null,
      $category: data.category ?? null,
      $frequency: data.frequency ?? null,
      $day_of_month: data.day_of_month ?? null,
      $day_of_week: data.day_of_week ?? null,
      $end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
    })
  }

  async function setActive(id: number, isActive: boolean) {
    const statement = await database.prepareAsync(`
      UPDATE recurring_transactions
      SET is_active = $is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $id
    `)
    await statement.executeAsync({ $id: id, $is_active: isActive ? 1 : 0 })
  }

  async function remove(id: number) {
    const statement = await database.prepareAsync(`
      DELETE FROM recurring_transactions WHERE id = $id
    `)
    await statement.executeAsync({ $id: id })
  }

  async function list() {
    return database.getAllAsync<RecurringResponse & { target_name: string }>(`
      SELECT r.*, t.name AS target_name
      FROM recurring_transactions r
      INNER JOIN targets t ON t.id = r.target_id
      ORDER BY r.is_active DESC, r.next_run ASC
    `)
  }

  async function show(id: number) {
    return database.getFirstAsync<RecurringResponse>(
      `SELECT * FROM recurring_transactions WHERE id = ?`,
      [id],
    )
  }

  async function listDue(untilMs: number) {
    return database.getAllAsync<RecurringResponse>(
      `SELECT * FROM recurring_transactions
       WHERE is_active = 1 AND next_run <= ?`,
      [new Date(untilMs).toISOString()],
    )
  }

  async function processOne(
    recurring: RecurringResponse,
    occurrences: number[],
    finalNextRun: number,
  ) {
    if (occurrences.length === 0) return

    await database.execAsync('BEGIN TRANSACTION')
    try {
      const insertTx = await database.prepareAsync(`
        INSERT INTO transactions
          (target_id, amount, observation, category, recurring_id, occurred_at)
        VALUES
          ($target_id, $amount, $observation, $category, $recurring_id, $occurred_at)
      `)
      for (const ts of occurrences) {
        await insertTx.executeAsync({
          $target_id: recurring.target_id,
          $amount: recurring.amount,
          $observation: recurring.observation,
          $category: recurring.category,
          $recurring_id: recurring.id,
          $occurred_at: new Date(ts).toISOString(),
        })
      }

      const updateRec = await database.prepareAsync(`
        UPDATE recurring_transactions
        SET next_run = $next_run,
            last_processed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $id
      `)
      await updateRec.executeAsync({
        $id: recurring.id,
        $next_run: new Date(finalNextRun).toISOString(),
      })

      await database.execAsync('COMMIT')
    } catch (error) {
      await database.execAsync('ROLLBACK')
      throw error
    }
  }

  return { create, update, setActive, remove, list, show, listDue, processOne }
}

function computeFirstRun(data: RecurringCreate): number {
  const start = new Date(data.start_date)

  if (data.frequency === 'monthly' && data.day_of_month != null) {
    const candidate = new Date(start.getFullYear(), start.getMonth(), data.day_of_month)
    if (candidate.getTime() < start.getTime()) {
      candidate.setMonth(candidate.getMonth() + 1)
    }
    const lastDay = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate()
    candidate.setDate(Math.min(data.day_of_month, lastDay))
    return candidate.getTime()
  }

  if (data.frequency === 'weekly' && data.day_of_week != null) {
    const candidate = new Date(start)
    while (candidate.getDay() !== data.day_of_week) {
      candidate.setDate(candidate.getDate() + 1)
    }
    return candidate.getTime()
  }

  return start.getTime()
}
