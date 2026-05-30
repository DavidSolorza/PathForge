import type { DbAdapter } from '@shared/services/DbAdapter'
import { LocalStorageAdapter } from '@shared/services/LocalStorageAdapter'
import type { Recommendation, ChatMessage } from '@shared/types'

const RECS_KEY = 'recommendations'
const CHAT_KEY = 'chat_history'
const GEN_KEY = 'generator_history'
let _adapter: DbAdapter = LocalStorageAdapter

export function setRecommendationAdapter(adapter: DbAdapter): void {
  _adapter = adapter
}

export const RecommendationStorageService = {
  async getAll(): Promise<Recommendation[]> {
    return (await _adapter.get<Recommendation[]>(RECS_KEY)) || []
  },

  async save(recs: Recommendation[]): Promise<void> {
    await _adapter.set(RECS_KEY, recs)
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    return (await _adapter.get<ChatMessage[]>(CHAT_KEY)) || []
  },

  async addChatMessage(msg: ChatMessage): Promise<void> {
    await _adapter.update<ChatMessage[]>(CHAT_KEY, (prev) => [...(prev || []), msg].slice(-50))
  },

  async setChatHistory(messages: ChatMessage[]): Promise<void> {
    await _adapter.set(CHAT_KEY, messages)
  },

  async clearChat(): Promise<void> {
    await _adapter.delete(CHAT_KEY)
  },

  async getGeneratorHistory(): Promise<ChatMessage[]> {
    return (await _adapter.get<ChatMessage[]>(GEN_KEY)) || []
  },

  async addGeneratorMessage(msg: ChatMessage): Promise<void> {
    await _adapter.update<ChatMessage[]>(GEN_KEY, (prev) => [...(prev || []), msg].slice(-50))
  },

  async setGeneratorHistory(messages: ChatMessage[]): Promise<void> {
    await _adapter.set(GEN_KEY, messages)
  },

  async clearGenerator(): Promise<void> {
    await _adapter.delete(GEN_KEY)
  },
}
