import type { Tag, TagCreate } from '@/@types/tag'
import { useSQLiteContext } from 'expo-sqlite'

export function useTagDatabase() {
  const database = useSQLiteContext()

  async function list() {
    return database.getAllAsync<Tag>(`SELECT * FROM tags ORDER BY name`)
  }

  async function create(data: TagCreate) {
    const statement = await database.prepareAsync(`
      INSERT OR IGNORE INTO tags (name, color) VALUES ($name, $color)
    `)
    const result = await statement.executeAsync({
      $name: data.name.trim(),
      $color: data.color ?? 'blue',
    })
    if (result.lastInsertRowId) return result.lastInsertRowId
    const existing = await database.getFirstAsync<{ id: number }>(
      `SELECT id FROM tags WHERE name = ?`,
      [data.name.trim()],
    )
    return existing?.id ?? 0
  }

  async function remove(id: number) {
    const statement = await database.prepareAsync(`DELETE FROM tags WHERE id = $id`)
    await statement.executeAsync({ $id: id })
  }

  async function tagsForTransaction(transactionId: number) {
    return database.getAllAsync<Tag>(
      `SELECT t.* FROM tags t
       INNER JOIN transaction_tags tt ON tt.tag_id = t.id
       WHERE tt.transaction_id = ?
       ORDER BY t.name`,
      [transactionId],
    )
  }

  async function setTagsForTransaction(transactionId: number, tagIds: number[]) {
    await database.execAsync('BEGIN TRANSACTION')
    try {
      const del = await database.prepareAsync(
        `DELETE FROM transaction_tags WHERE transaction_id = $tid`,
      )
      await del.executeAsync({ $tid: transactionId })

      if (tagIds.length > 0) {
        const ins = await database.prepareAsync(
          `INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($tid, $gid)`,
        )
        for (const tagId of tagIds) {
          await ins.executeAsync({ $tid: transactionId, $gid: tagId })
        }
      }
      await database.execAsync('COMMIT')
    } catch (e) {
      await database.execAsync('ROLLBACK')
      throw e
    }
  }

  return {
    list,
    create,
    remove,
    tagsForTransaction,
    setTagsForTransaction,
  }
}
