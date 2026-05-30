export interface DbAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  update<T>(key: string, updater: (prev: T | null) => T): Promise<T>
  delete(key: string): Promise<void>
  getAll<T>(key: string): Promise<T[]>
  getById<T>(key: string, id: string): Promise<T | null>
}
