import { PathStorageService } from './PathStorageService'
import type { Topic } from '@shared/types'

const INTERVALS = [1, 3, 7, 14, 30]

export const ReviewService = {
  scheduleReview(topic: Topic) {
    const intervalIndex = topic.reviewInterval !== undefined
      ? INTERVALS.indexOf(topic.reviewInterval)
      : -1
    const nextIndex = Math.min(intervalIndex + 1, INTERVALS.length - 1)
    const nextInterval = nextIndex >= 0 ? INTERVALS[nextIndex] : 1
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + nextInterval)
    return {
      reviewDueAt: dueDate.toISOString(),
      reviewInterval: nextInterval,
    }
  },

  async getDueTopics(): Promise<{ pathId: string; pathTitle: string; topic: Topic }[]> {
    try {
      const paths = await PathStorageService.getAll()
      if (!Array.isArray(paths)) return []
      const now = new Date()
      const due: { pathId: string; pathTitle: string; topic: Topic }[] = []
      for (const path of paths) {
        if (!path?.stages) continue
        for (const stage of path.stages) {
          if (!stage?.topics) continue
          for (const topic of stage.topics) {
            if (topic?.completed && topic.reviewDueAt && new Date(topic.reviewDueAt) <= now) {
              due.push({ pathId: path.id, pathTitle: path.title, topic })
            }
          }
        }
      }
      return due
    } catch { return [] }
  },

  async markReviewed(pathId: string, stageId: string, topicId: string) {
    const path = await PathStorageService.getById(pathId)
    if (!path) return
    for (const stage of path.stages) {
      if (stage.id !== stageId) continue
      const topic = stage.topics.find((t) => t.id === topicId)
      if (!topic) continue
      const { reviewDueAt, reviewInterval } = this.scheduleReview(topic)
      topic.reviewDueAt = reviewDueAt
      topic.reviewInterval = reviewInterval
      break
    }
    await PathStorageService.update(pathId, path)
  },
}
