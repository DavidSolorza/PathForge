import { LocalStorageService } from '@shared/services/LocalStorageService'
import type { LearningPath } from '@shared/types'

const PATHS_KEY = 'learning_paths'

export const PathStorageService = {
  getAll(): LearningPath[] {
    return LocalStorageService.get<LearningPath[]>(PATHS_KEY) || []
  },

  getById(id: string): LearningPath | undefined {
    return this.getAll().find((p) => p.id === id)
  },

  save(path: LearningPath): void {
    LocalStorageService.update<LearningPath[]>(PATHS_KEY, (prev) => {
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

  create(input: { title: string; goal: string; category: string; difficulty: 'beginner' | 'intermediate' | 'advanced'; stages: LearningPath['stages'] }): LearningPath {
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
    this.save(newPath)
    return newPath
  },

  updateTopic(pathId: string, stageId: string, topicId: string, completed: boolean): LearningPath | undefined {
    const path = this.getById(pathId)
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
    this.save(path)
    return path
  },

  remove(id: string): void {
    LocalStorageService.update<LearningPath[]>(PATHS_KEY, (prev) => (prev || []).filter((p) => p.id !== id))
  },

  recalculateProgress(pathId: string): number {
    const path = this.getById(pathId)
    if (!path) return 0

    const allTopics = path.stages.flatMap((s) => s.topics)
    const completed = allTopics.filter((t) => t.completed).length
    const progress = allTopics.length > 0 ? Math.round((completed / allTopics.length) * 100) : 0

    path.progress = progress
    path.updatedAt = new Date().toISOString()
    this.save(path)
    return progress
  },
}
