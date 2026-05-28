import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatProgress, truncate } from '@shared/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })
})

describe('formatDate', () => {
  it('formats a date string in Spanish locale', () => {
    const result = formatDate('2026-05-28T12:00:00Z')
    expect(result).toContain('mayo')
    expect(result).toContain('2026')
  })
})

describe('formatProgress', () => {
  it('formats 0%', () => {
    expect(formatProgress(0)).toBe('0%')
  })

  it('rounds and formats', () => {
    expect(formatProgress(75.3)).toBe('75%')
  })

  it('formats 100%', () => {
    expect(formatProgress(100)).toBe('100%')
  })
})

describe('truncate', () => {
  it('returns string unchanged if within length', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })
})
