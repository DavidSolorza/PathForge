import { describe, it, expect, beforeEach } from 'vitest'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { LocalStorageService } from '@shared/services/LocalStorageService'

describe('UserStorageService', () => {
  beforeEach(() => {
    LocalStorageService.clear()
  })

  describe('getStats', () => {
    it('returns default stats when none saved', async () => {
      const stats = await UserStorageService.getStats()
      expect(stats.totalPaths).toBe(0)
      expect(stats.completedTopics).toBe(0)
      expect(stats.totalProgress).toBe(0)
      expect(stats.streak).toBe(0)
      expect(stats.activeDays).toBe(0)
      expect(stats.favoriteCategory).toBe('')
    })
  })

  describe('updateStats', () => {
    it('updates stats with callback', async () => {
      await UserStorageService.updateStats((prev) => ({ ...prev, totalPaths: prev.totalPaths + 1 }))
      const stats = await UserStorageService.getStats()
      expect(stats.totalPaths).toBe(1)
    })
  })

  describe('getActivity', () => {
    it('returns empty array when no activity', async () => {
      expect(await UserStorageService.getActivity()).toEqual([])
    })
  })

  describe('addActivity', () => {
    it('adds an activity entry', async () => {
      const activity = {
        id: 'act_1',
        type: 'path_created' as const,
        title: 'Nueva ruta',
        pathName: 'Python',
        timestamp: new Date().toISOString(),
      }
      await UserStorageService.addActivity(activity)
      const activities = await UserStorageService.getActivity()
      expect(activities).toHaveLength(1)
      expect(activities[0].title).toBe('Nueva ruta')
    })

    it('keeps only last 20 activities', async () => {
      for (let i = 0; i < 30; i++) {
        await UserStorageService.addActivity({
          id: `act_${i}`,
          type: 'topic_completed',
          title: `Topic ${i}`,
          pathName: 'Test',
          timestamp: new Date().toISOString(),
        })
      }
      expect(await UserStorageService.getActivity()).toHaveLength(20)
    })
  })
})
