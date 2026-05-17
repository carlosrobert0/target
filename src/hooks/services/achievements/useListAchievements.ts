import { useAchievementsDatabase } from '@/database/useAchievementsDatabase'
import { useQuery } from '@tanstack/react-query'
import { ACHIEVEMENT_LIST, ACHIEVEMENTS, type AchievementKey } from '@/utils/achievements'

export type AchievementEntry = (typeof ACHIEVEMENT_LIST)[number] & {
  unlocked: boolean
  unlockedAt: string | null
}

export function useListAchievements() {
  const { listUnlocked } = useAchievementsDatabase()
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async (): Promise<AchievementEntry[]> => {
      const rows = await listUnlocked()
      const byKey = new Map(rows.map((r) => [r.key, r.unlocked_at]))
      return ACHIEVEMENT_LIST.map((def) => ({
        ...def,
        unlocked: byKey.has(def.key),
        unlockedAt: byKey.get(def.key) ?? null,
      }))
    },
  })
}

export function useUnlockedCount() {
  const { data } = useListAchievements()
  return data?.filter((a) => a.unlocked).length ?? 0
}
