import { LocalStorageService } from './LocalStorageService'

export interface Repository<T extends { id: string }> {
  getAll(): T[]
  getById(id: string): T | undefined
  remove(id: string): void
  clear(): void
}

export abstract class BaseRepository<T extends { id: string }> implements Repository<T> {
  protected storageKey: string

  constructor(key: string) {
    this.storageKey = key
  }

  getAll(): T[] {
    return LocalStorageService.get<T[]>(this.storageKey) || []
  }

  getById(id: string): T | undefined {
    return this.getAll().find((item) => item.id === id)
  }

  protected saveAll(items: T[]): void {
    LocalStorageService.set(this.storageKey, items)
  }

  remove(id: string): void {
    const items = this.getAll().filter((item) => item.id !== id)
    this.saveAll(items)
  }

  clear(): void {
    LocalStorageService.remove(this.storageKey)
  }
}
