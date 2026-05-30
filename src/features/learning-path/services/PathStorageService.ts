import type { DbAdapter } from '@shared/services/DbAdapter'
import { LocalStorageAdapter } from '@shared/services/LocalStorageAdapter'
import type { LearningPath } from '@shared/types'

const PATHS_KEY = 'learning_paths'
let _adapter: DbAdapter = LocalStorageAdapter

export function setPathAdapter(adapter: DbAdapter): void {
  _adapter = adapter
}

export const PathStorageService = {
  async getAll(): Promise<LearningPath[]> {
    return (await _adapter.get<LearningPath[]>(PATHS_KEY)) || []
  },

  getAllSync(): LearningPath[] {
    try {
      const raw = localStorage.getItem('pathforge_' + PATHS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  async getById(id: string): Promise<LearningPath | undefined> {
    const all = await this.getAll()
    return all.find((p) => p.id === id)
  },

  async save(path: LearningPath): Promise<void> {
    await _adapter.update<LearningPath[]>(PATHS_KEY, (prev) => {
      const list = prev || []
      const idx = list.findIndex((p) => p.id === path.id)
      if (idx >= 0) {
        list[idx] = path
      } else {
        list.push(path)
      }
      return list
    })
  },

  async create(input: { title: string; goal: string; category: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; stages: LearningPath['stages'] }): Promise<LearningPath> {
    const newPath: LearningPath = {
      id: 'path_' + Date.now(),
      title: input.title,
      goal: input.goal,
      category: input.category,
      difficulty: input.difficulty,
      progress: 0,
      stages: input.stages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await this.save(newPath)
    return newPath
  },

  async updateTopic(pathId: string, stageId: string, topicId: string, completed: boolean): Promise<LearningPath | undefined> {
    const path = await this.getById(pathId)
    if (!path) return undefined

    const stage = path.stages.find((s) => s.id === stageId)
    if (!stage) return undefined

    const topic = stage.topics.find((t) => t.id === topicId)
    if (!topic) return undefined

    topic.completed = completed
    topic.completedAt = completed ? new Date().toISOString() : undefined

    const allTopics = path.stages.flatMap((s) => s.topics)
    const completedTopics = allTopics.filter((t) => t.completed).length
    path.progress = Math.round((completedTopics / allTopics.length) * 100)

    const allCompleted = stage.topics.every((t) => t.completed)
    stage.status = allCompleted ? 'completed' : stage.topics.some((t) => t.completed) ? 'in_progress' : 'pending'

    path.updatedAt = new Date().toISOString()
    await this.save(path)
    return path
  },

  async update(id: string, path: LearningPath): Promise<void> {
    path.updatedAt = new Date().toISOString()
    await this.save(path)
  },

  async remove(id: string): Promise<void> {
    await _adapter.update<LearningPath[]>(PATHS_KEY, (prev) => (prev || []).filter((p) => p.id !== id))
  },

  async recalculateProgress(pathId: string): Promise<number> {
    const path = await this.getById(pathId)
    if (!path) return 0

    const allTopics = path.stages.flatMap((s) => s.topics)
    const completed = allTopics.filter((t) => t.completed).length
    const progress = allTopics.length > 0 ? Math.round((completed / allTopics.length) * 100) : 0

    path.progress = progress
    path.updatedAt = new Date().toISOString()
    await this.save(path)
    return progress
  },
}
