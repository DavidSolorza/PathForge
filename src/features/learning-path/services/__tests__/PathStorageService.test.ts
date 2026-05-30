import { describe, it, expect, beforeEach } from 'vitest'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { LocalStorageService } from '@shared/services/LocalStorageService'
import type { LearningPath } from '@shared/types'

function makePath(overrides: Partial<LearningPath> = {}): LearningPath {
  return {
    id: 'path_test',
    title: 'Aprendiendo Python',
    goal: 'aprender python',
    category: 'tecnologia',
    difficulty: 'beginner',
    progress: 0,
    stages: [
      {
        id: 'stage_1',
        name: 'Fundamentos',
        description: 'Base de Python',
        order: 0,
        status: 'in_progress',
        topics: [
          { id: 't1', name: 'Variables', difficulty: 'easy', completed: false, resources: [] },
          { id: 't2', name: 'Bucles', difficulty: 'easy', completed: false, resources: [] },
        ],
      },
      {
        id: 'stage_2',
        name: 'Avanzado',
        description: 'Python avanzado',
        order: 1,
        status: 'pending',
        topics: [
          { id: 't3', name: 'Decoradores', difficulty: 'hard', completed: false, resources: [] },
        ],
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('PathStorageService', () => {
  beforeEach(() => {
    LocalStorageService.clear()
  })

  describe('getAll', () => {
    it('returns empty array when no paths', async () => {
      expect(await PathStorageService.getAll()).toEqual([])
    })

    it('returns saved paths', async () => {
      const path = makePath()
      await PathStorageService.save(path)
      expect(await PathStorageService.getAll()).toHaveLength(1)
      expect((await PathStorageService.getAll())[0].id).toBe('path_test')
    })
  })

  describe('getById', () => {
    it('returns undefined for missing path', async () => {
      expect(await PathStorageService.getById('ghost')).toBeUndefined()
    })

    it('finds a saved path', async () => {
      await PathStorageService.save(makePath())
      expect(await PathStorageService.getById('path_test')).toBeDefined()
    })
  })

  describe('save', () => {
    it('adds a new path', async () => {
      await PathStorageService.save(makePath())
      expect(await PathStorageService.getAll()).toHaveLength(1)
    })

    it('updates an existing path', async () => {
      await PathStorageService.save(makePath())
      await PathStorageService.save(makePath({ title: 'Python Updated' }))
      const paths = await PathStorageService.getAll()
      expect(paths).toHaveLength(1)
      expect(paths[0].title).toBe('Python Updated')
    })
  })

  describe('create', () => {
    it('creates a path with default values', async () => {
      const path = await PathStorageService.create({
        title: 'Nueva Ruta',
        goal: 'aprender node',
        category: 'tecnologia',
        difficulty: 'intermediate',
        stages: makePath().stages,
      })
      expect(path.title).toBe('Nueva Ruta')
      expect(path.goal).toBe('aprender node')
      expect(path.progress).toBe(0)
      expect(path.id).toMatch(/^path_/)
      expect(path.createdAt).toBeDefined()
      expect(path.updatedAt).toBeDefined()
    })
  })

  describe('updateTopic', () => {
    it('marks a topic as completed and recalculates progress', async () => {
      await PathStorageService.save(makePath())
      const updated = await PathStorageService.updateTopic('path_test', 'stage_1', 't1', true)
      expect(updated).toBeDefined()
      expect(updated!.stages[0].topics[0].completed).toBe(true)
      expect(updated!.stages[0].topics[0].completedAt).toBeDefined()
      expect(updated!.progress).toBe(33)
    })

    it('marks a stage as completed when all topics done', async () => {
      await PathStorageService.save(makePath())
      await PathStorageService.updateTopic('path_test', 'stage_1', 't1', true)
      await PathStorageService.updateTopic('path_test', 'stage_1', 't2', true)
      const path = await PathStorageService.getById('path_test')
      expect(path!.stages[0].status).toBe('completed')
      expect(path!.progress).toBe(67)
    })

    it('returns undefined for invalid path/stage/topic', async () => {
      await PathStorageService.save(makePath())
      expect(await PathStorageService.updateTopic('invalid', 's1', 't1', true)).toBeUndefined()
      expect(await PathStorageService.updateTopic('path_test', 'invalid', 't1', true)).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('deletes a path', async () => {
      await PathStorageService.save(makePath())
      await PathStorageService.remove('path_test')
      expect(await PathStorageService.getAll()).toHaveLength(0)
    })
  })

  describe('recalculateProgress', () => {
    it('calculates 0 for no topics', async () => {
      const path = makePath({ stages: [{ id: 's0', name: 'Empty', description: '', order: 0, status: 'pending', topics: [] }] })
      await PathStorageService.save(path)
      expect(await PathStorageService.recalculateProgress('path_test')).toBe(0)
    })

    it('returns 0 for missing path', async () => {
      expect(await PathStorageService.recalculateProgress('ghost')).toBe(0)
    })
  })
})
