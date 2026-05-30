import type { DbAdapter } from './DbAdapter'
import { apiGet, apiPost, apiPut, apiDelete } from './ApiService'
import { LocalStorageService } from './LocalStorageService'

const COLLECTION_MAP: Record<string, string> = {
  learning_paths: 'paths',
  projects: 'projects',
  chat_history: 'chat',
  activity: 'activity',
  stats: 'stats',
}

export const ApiAdapter: DbAdapter = {
  async get<T>(key: string): Promise<T | null> {
    const collection = COLLECTION_MAP[key]
    if (!collection) return LocalStorageService.get<T>(key)
    try {
      return await apiGet<T>(`/${collection}`)
    } catch {
      return LocalStorageService.get<T>(key)
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    LocalStorageService.set(key, value)
    const collection = COLLECTION_MAP[key]
    if (!collection) return
    try {
      await apiPost(`/${collection}`, value)
    } catch {
      // offline — kept in localStorage
    }
  },

  async update<T>(key: string, updater: (prev: T | null) => T): Promise<T> {
    const current = LocalStorageService.get<T>(key)
    const next = updater(current)
    LocalStorageService.set(key, next)
    const collection = COLLECTION_MAP[key]
    if (collection) {
      try {
        await apiPut(`/${collection}`, next)
      } catch {
        // offline — kept in localStorage
      }
    }
    return next
  },

  async delete(key: string): Promise<void> {
    LocalStorageService.remove(key)
  },

  async getAll<T>(key: string): Promise<T[]> {
    const collection = COLLECTION_MAP[key]
    if (!collection) return LocalStorageService.get<T[]>(key) || []
    try {
      return await apiGet<T[]>(`/${collection}`)
    } catch {
      return LocalStorageService.get<T[]>(key) || []
    }
  },

  async getById<T>(key: string, id: string): Promise<T | null> {
    const collection = COLLECTION_MAP[key]
    if (!collection) return null
    const all = await this.getAll<T>(key)
    return (all as any[]).find((item: any) => item.id === id) || null
  },
}

export async function saveToApi<T>(key: string, data: T): Promise<void> {
  const collection = COLLECTION_MAP[key]
  if (!collection) return
  try {
    await apiPut(`/${collection}`, data)
  } catch {
    // silently fail — localStorage fallback
  }
}
