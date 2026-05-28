import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageService } from '@shared/services/LocalStorageService'

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores and retrieves a value', () => {
    LocalStorageService.set('test_key', { foo: 'bar' })
    const result = LocalStorageService.get<{ foo: string }>('test_key')
    expect(result).toEqual({ foo: 'bar' })
  })

  it('returns null for missing key', () => {
    const result = LocalStorageService.get('nonexistent')
    expect(result).toBeNull()
  })

  it('checks if a key exists', () => {
    expect(LocalStorageService.exists('some_key')).toBe(false)
    LocalStorageService.set('some_key', 42)
    expect(LocalStorageService.exists('some_key')).toBe(true)
  })

  it('removes a key', () => {
    LocalStorageService.set('temp', 'value')
    expect(LocalStorageService.exists('temp')).toBe(true)
    LocalStorageService.remove('temp')
    expect(LocalStorageService.exists('temp')).toBe(false)
  })

  it('returns only prefixed keys', () => {
    localStorage.setItem('other_app', 'data')
    LocalStorageService.set('my_data', 1)
    LocalStorageService.set('other_data', 2)
    const keys = LocalStorageService.keys()
    expect(keys).toContain('my_data')
    expect(keys).toContain('other_data')
    expect(keys).not.toContain('other_app')
  })

  it('clears all prefixed keys', () => {
    LocalStorageService.set('a', 1)
    LocalStorageService.set('b', 2)
    localStorage.setItem('other', 'keep')
    LocalStorageService.clear()
    expect(LocalStorageService.exists('a')).toBe(false)
    expect(LocalStorageService.exists('b')).toBe(false)
    expect(localStorage.getItem('other')).toBe('keep')
  })

  it('updates with a callback', () => {
    LocalStorageService.set('counter', 0)
    const result = LocalStorageService.update<number>('counter', (prev) => (prev ?? 0) + 1)
    expect(result).toBe(1)
    expect(LocalStorageService.get<number>('counter')).toBe(1)
  })
})
