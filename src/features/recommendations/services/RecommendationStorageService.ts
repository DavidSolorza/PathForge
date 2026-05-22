import { LocalStorageService } from '@shared/services/LocalStorageService'
import type { Recommendation, ChatMessage } from '@shared/types'

const RECS_KEY = 'recommendations'
const CHAT_KEY = 'chat_history'

const GEN_KEY = 'generator_history'

export const RecommendationStorageService = {
  getAll(): Recommendation[] {
    return LocalStorageService.get<Recommendation[]>(RECS_KEY) || []
  },

  save(recs: Recommendation[]): void {
    LocalStorageService.set(RECS_KEY, recs)
  },

  getChatHistory(): ChatMessage[] {
    return LocalStorageService.get<ChatMessage[]>(CHAT_KEY) || []
  },

  addChatMessage(msg: ChatMessage): void {
    LocalStorageService.update<ChatMessage[]>(CHAT_KEY, (prev) => [...(prev || []), msg].slice(-50))
  },

  clearChat(): void {
    LocalStorageService.remove(CHAT_KEY)
  },

  getGeneratorHistory(): ChatMessage[] {
    return LocalStorageService.get<ChatMessage[]>(GEN_KEY) || []
  },

  addGeneratorMessage(msg: ChatMessage): void {
    LocalStorageService.update<ChatMessage[]>(GEN_KEY, (prev) => [...(prev || []), msg].slice(-50))
  },

  clearGenerator(): void {
    LocalStorageService.remove(GEN_KEY)
  },
}
