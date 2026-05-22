const PREFIX = 'pathforge_'

export const LocalStorageService = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.error(`LocalStorageService.set error for key "${key}":`, e)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch (e) {
      console.error(`LocalStorageService.remove error for key "${key}":`, e)
    }
  },

  exists(key: string): boolean {
    try {
      return localStorage.getItem(PREFIX + key) !== null
    } catch {
      return false
    }
  },

  clear(): void {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith(PREFIX)) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch (e) {
      console.error('LocalStorageService.clear error:', e)
    }
  },

  keys(): string[] {
    try {
      const result: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith(PREFIX)) {
          result.push(k.slice(PREFIX.length))
        }
      }
      return result
    } catch {
      return []
    }
  },

  update<T>(key: string, updater: (prev: T | null) => T): T {
    const prev = this.get<T>(key)
    const next = updater(prev)
    this.set(key, next)
    return next
  },
}
