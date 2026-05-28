import { describe, it, expect } from 'vitest'
import { searchResources, formatResourcesAsText } from '@features/recommendations/services/curatedResources'

describe('searchResources', () => {
  it('finds Python resources', () => {
    const results = searchResources('python')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.title.toLowerCase().includes('python'))).toBe(true)
  })

  it('finds JavaScript resources', () => {
    const results = searchResources('javascript')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.author === 'midudev')).toBe(true)
  })

  it('returns default resources for unknown topic', () => {
    const results = searchResources('xyznonexistenttopic')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].title).toContain('freeCodeCamp')
  })

  it('filters by documentation type', () => {
    const results = searchResources('python', 'libro')
    expect(results.every((r) => r.type === 'book' || r.type === 'documentation')).toBe(true)
  })

  it('skips video type filter', () => {
    const results = searchResources('python', 'video')
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('formatResourcesAsText', () => {
  it('returns empty string for empty array', () => {
    expect(formatResourcesAsText([])).toBe('')
  })

  it('formats resources with markdown', () => {
    const resources = searchResources('python')
    const text = formatResourcesAsText(resources)
    expect(text).toContain('1.')
    expect(text).toContain('[curso')
  })
})
