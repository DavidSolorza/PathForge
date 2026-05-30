import type { DbAdapter } from './DbAdapter'
import { LocalStorageService } from './LocalStorageService'

export const LocalStorageAdapter: DbAdapter = {
  async get<T>(key: string): Promise<T | null> {
    return LocalStorageService.get<T>(key)
  },

  async set<T>(key: string, value: T): Promise<void> {
    LocalStorageService.set(key, value)
  },

  async update<T>(key: string, updater: (prev: T | null) => T): Promise<T> {
    return LocalStorageService.update<T>(key, updater)
  },

  async delete(key: string): Promise<void> {
    LocalStorageService.remove(key)
  },

  async getAll<T>(key: string): Promise<T[]> {
    return LocalStorageService.get<T[]>(key) || []
  },

  async getById<T>(key: string, id: string): Promise<T | null> {
    const all = await this.getAll<T>(key)
    return (all as any[]).find((item: any) => item.id === id) || null
  },
}
