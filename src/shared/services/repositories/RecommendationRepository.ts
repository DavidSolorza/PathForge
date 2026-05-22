import { BaseRepository } from '../BaseRepository'
import { LocalStorageService } from '../LocalStorageService'
import type { Recommendation, ChatMessage } from '@shared/types'

const CHAT_KEY = 'chat_history'

class RecommendationRepositoryImpl extends BaseRepository<Recommendation> {
  constructor() {
    super('recommendations')
  }

  create(input: Omit<Recommendation, 'id' | 'createdAt'> & { updatedAt?: string }): Recommendation {
    const items = this.getAll()
    const now = new Date().toISOString()
    const newItem: Recommendation = {
      ...input,
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
    }
    items.push(newItem)
    this.saveAll(items)
    return newItem
  }

  getChatHistory(): ChatMessage[] {
    return LocalStorageService.get<ChatMessage[]>(CHAT_KEY) || []
  }

  addChatMessage(msg: ChatMessage): void {
    LocalStorageService.update<ChatMessage[]>(CHAT_KEY, (prev) => [...(prev || []), msg].slice(-50))
  }

  clearChat(): void {
    LocalStorageService.remove(CHAT_KEY)
  }
}

export const RecommendationRepository = new RecommendationRepositoryImpl()
