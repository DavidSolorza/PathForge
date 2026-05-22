import { BaseRepository } from '../BaseRepository'
import type { LearningPath } from '@shared/types'

class PathRepositoryImpl extends BaseRepository<LearningPath> {
  constructor() {
    super('learning_paths')
  }

  create(input: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt'>): LearningPath {
    const items = this.getAll()
    const now = new Date().toISOString()
    const newItem: LearningPath = {
      ...input,
      id: `path_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    }
    items.push(newItem)
    this.saveAll(items)
    return newItem
  }

  update(id: string, updates: Partial<LearningPath>): LearningPath | undefined {
    const items = this.getAll()
    const idx = items.findIndex((item) => item.id === id)
    if (idx === -1) return undefined
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() }
    this.saveAll(items)
    return items[idx]
  }

  getByCategory(category: string): LearningPath[] {
    return this.getAll().filter((p) => p.category === category)
  }

  getActive(): LearningPath[] {
    return this.getAll().filter((p) => p.progress < 100)
  }

  getCompleted(): LearningPath[] {
    return this.getAll().filter((p) => p.progress >= 100)
  }

  toggleTopic(pathId: string, stageId: string, topicId: string): LearningPath | undefined {
    const path = this.getById(pathId)
    if (!path) return undefined
    const stage = path.stages.find((s) => s.id === stageId)
    if (!stage) return undefined
    const topic = stage.topics.find((t) => t.id === topicId)
    if (!topic) return undefined

    topic.completed = !topic.completed
    topic.completedAt = topic.completed ? new Date().toISOString() : undefined

    const stageTopics = stage.topics
    const stageDone = stageTopics.filter((t) => t.completed).length
    stage.status = stageDone === 0 ? 'pending' : stageDone === stageTopics.length ? 'completed' : 'in_progress'

    const allTopics = path.stages.flatMap((s) => s.topics)
    const completed = allTopics.filter((t) => t.completed).length
    path.progress = allTopics.length > 0 ? Math.round((completed / allTopics.length) * 100) : 0

    return this.update(pathId, { progress: path.progress, stages: path.stages } as Partial<LearningPath>)
  }
}

export const PathRepository = new PathRepositoryImpl()
