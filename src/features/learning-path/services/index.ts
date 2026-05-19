import { LocalDB } from '@shared/lib/db'
import type { LearningPath } from '@shared/types'

export const LearningPathService = {
  async getAll(): Promise<LearningPath[]> {
    await new Promise((r) => setTimeout(r, 200))
    return LocalDB.getLearningPaths()
  },

  async getById(id: string): Promise<LearningPath | undefined> {
    await new Promise((r) => setTimeout(r, 200))
    return LocalDB.getLearningPath(id)
  },

  async create(goal: string): Promise<LearningPath> {
    await new Promise((r) => setTimeout(r, 300))
    const newPath: LearningPath = {
      id: 'lp' + Date.now(),
      goal,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stages: [
        {
          id: 'st' + Date.now(),
          name: 'Fundamentos',
          description: 'Comienza desde lo básico',
          order: 1,
          status: 'available',
          progress: 0,
          technologies: [],
          resources: [],
        },
        {
          id: 'st' + (Date.now() + 1),
          name: 'Práctica',
          description: 'Aplica lo aprendido',
          order: 2,
          status: 'locked',
          progress: 0,
          technologies: [],
          resources: [],
        },
        {
          id: 'st' + (Date.now() + 2),
          name: 'Proyectos',
          description: 'Construye proyectos reales',
          order: 3,
          status: 'locked',
          progress: 0,
          technologies: [],
          resources: [],
        },
      ],
    }
    return LocalDB.addLearningPath(newPath)
  },

  async updateStage(pathId: string, stageId: string, updates: { progress?: number; status?: 'locked' | 'available' | 'in_progress' | 'completed' }): Promise<void> {
    await new Promise((r) => setTimeout(r, 100))
    LocalDB.updateStage(pathId, stageId, updates)
  },
}
