import { LocalStorageService } from '@shared/services/LocalStorageService'
import type { User, UserStats } from '@shared/types'

const USERS_KEY = 'users'
const STATS_KEY = 'stats'
const ACTIVITY_KEY = 'activity'

export const UserStorageService = {
  getUsers(): { email: string; password: string; user: User }[] {
    return LocalStorageService.get<{ email: string; password: string; user: User }[]>(USERS_KEY) || []
  },

  saveUsers(users: { email: string; password: string; user: User }[]): void {
    LocalStorageService.set(USERS_KEY, users)
  },

  getStats(): UserStats {
    return LocalStorageService.get<UserStats>(STATS_KEY) || {
      totalPaths: 0,
      completedTopics: 0,
      totalProgress: 0,
      streak: 0,
      favoriteCategory: '',
      activeDays: 0,
    }
  },

  saveStats(stats: UserStats): void {
    LocalStorageService.set(STATS_KEY, stats)
  },

  updateStats(updater: (prev: UserStats) => UserStats): UserStats {
    return LocalStorageService.update<UserStats>(STATS_KEY, (prev) => {
      const defaultStats: UserStats = { totalPaths: 0, completedTopics: 0, totalProgress: 0, streak: 0, favoriteCategory: '', activeDays: 0 }
      return updater(prev || defaultStats)
    })
  },

  getActivity(): { id: string; type: string; title: string; pathName: string; timestamp: string }[] {
    return LocalStorageService.get<{ id: string; type: string; title: string; pathName: string; timestamp: string }[]>(ACTIVITY_KEY) || []
  },

  addActivity(activity: { id: string; type: string; title: string; pathName: string; timestamp: string }): void {
    LocalStorageService.update<{ id: string; type: string; title: string; pathName: string; timestamp: string }[]>(
      ACTIVITY_KEY,
      (prev) => [activity, ...(prev || [])].slice(0, 20),
    )
  },
}
