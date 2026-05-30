import type { DbAdapter } from '@shared/services/DbAdapter'
import { LocalStorageAdapter } from '@shared/services/LocalStorageAdapter'
import type { User, UserStats } from '@shared/types'

const USERS_KEY = 'users'
const STATS_KEY = 'stats'
const ACTIVITY_KEY = 'activity'
let _adapter: DbAdapter = LocalStorageAdapter

export function setUserAdapter(adapter: DbAdapter): void {
  _adapter = adapter
}

export const UserStorageService = {
  async getUsers(): Promise<{ email: string; password: string; user: User }[]> {
    return (await _adapter.get<{ email: string; password: string; user: User }[]>(USERS_KEY)) || []
  },

  async saveUsers(users: { email: string; password: string; user: User }[]): Promise<void> {
    await _adapter.set(USERS_KEY, users)
  },

  async getStats(): Promise<UserStats> {
    return (await _adapter.get<UserStats>(STATS_KEY)) || {
      totalPaths: 0,
      completedTopics: 0,
      totalProgress: 0,
      streak: 0,
      favoriteCategory: '',
      activeDays: 0,
      longestStreak: 0,
    }
  },

  async saveStats(stats: UserStats): Promise<void> {
    await _adapter.set(STATS_KEY, stats)
  },

  async updateStats(updater: (prev: UserStats) => UserStats): Promise<UserStats> {
    return _adapter.update<UserStats>(STATS_KEY, (prev) => {
      const defaultStats: UserStats = { totalPaths: 0, completedTopics: 0, totalProgress: 0, streak: 0, favoriteCategory: '', activeDays: 0, longestStreak: 0 }
      return updater(prev || defaultStats)
    })
  },

  async getActivity(): Promise<{ id: string; type: string; title: string; pathName: string; timestamp: string }[]> {
    return (await _adapter.get<{ id: string; type: string; title: string; pathName: string; timestamp: string }[]>(ACTIVITY_KEY)) || []
  },

  async addActivity(activity: { id: string; type: string; title: string; pathName: string; timestamp: string }): Promise<void> {
    await _adapter.update<{ id: string; type: string; title: string; pathName: string; timestamp: string }[]>(
      ACTIVITY_KEY,
      (prev) => [activity, ...(prev || [])].slice(0, 20),
    )
  },
}
