import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, Recommendation } from '@shared/types'
import { RecommendationStorageService } from '../services/RecommendationStorageService'

interface AIState {
  messages: ChatMessage[]
  recommendations: Recommendation[]
  loading: boolean
  addMessage: (msg: ChatMessage) => void
  setMessages: (msgs: ChatMessage[]) => void
  clearMessages: () => void
  setRecommendations: (recs: Recommendation[]) => void
  setLoading: (loading: boolean) => void
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      messages: [],
      recommendations: [],
      loading: false,
      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg].slice(-50) })),
      setMessages: (msgs) => set({ messages: msgs }),
      clearMessages: () => set({ messages: [] }),
      setRecommendations: (recs) => set({ recommendations: recs }),
      setLoading: (loading) => set({ loading }),
    }),
    { name: 'pathforge_ai' },
  ),
)
