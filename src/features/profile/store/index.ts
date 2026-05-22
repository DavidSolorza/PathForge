import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserStats, RecentActivity } from '@shared/types'
import { UserStorageService } from '../services/UserStorageService'

interface ProfileState {
  stats: UserStats
  activity: RecentActivity[]
  loading: boolean
  setStats: (stats: UserStats) => void
  setActivity: (activity: RecentActivity[]) => void
  setLoading: (loading: boolean) => void
  refresh: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      stats: {
        totalPaths: 0,
        completedTopics: 0,
        totalProgress: 0,
        streak: 0,
        favoriteCategory: '',
        activeDays: 0,
      },
      activity: [],
      loading: false,
      setStats: (stats) => set({ stats }),
      setActivity: (activity) => set({ activity }),
      setLoading: (loading) => set({ loading }),
      refresh: () => {
        set({
          stats: UserStorageService.getStats(),
          activity: UserStorageService.getActivity() as RecentActivity[],
        })
      },
    }),
    { name: 'pathforge_profile' },
  ),
)
