import { useSQLiteContext } from 'expo-sqlite'

export type AchievementRow = {
  key: string
  unlocked_at: string
}

export function useAchievementsDatabase() {
  const database = useSQLiteContext()

  async function listUnlocked() {
    return database.getAllAsync<AchievementRow>(
      `SELECT * FROM achievements ORDER BY unlocked_at DESC`,
    )
  }

  async function isUnlocked(key: string) {
    const row = await database.getFirstAsync<{ key: string }>(
      `SELECT key FROM achievements WHERE key = ?`,
      [key],
    )
    return !!row
  }

  async function unlock(key: string): Promise<boolean> {
    const already = await isUnlocked(key)
    if (already) return false
    const statement = await database.prepareAsync(
      `INSERT OR IGNORE INTO achievements (key) VALUES ($key)`,
    )
    const result = await statement.executeAsync({ $key: key })
    return result.changes > 0
  }

  return { listUnlocked, isUnlocked, unlock }
}
