import { curatedResources } from '@features/learning-path/data/curatedResources'
import type { CuratedResource } from '@shared/types'

const keywordMap: Record<string, string[]> = {
  python: ['python'],
  javascript: ['javascript', 'js'],
  js: ['javascript', 'js'],
  typescript: ['typescript'],
  react: ['react'],
  node: ['node.js', 'nodejs', 'node'],
  html: ['html', 'css', 'frontend', 'web'],
  css: ['html', 'css', 'frontend', 'web'],
  docker: ['docker'],
  git: ['git'],
  sql: ['sql', 'database'],
  database: ['sql', 'database'],
  algoritmo: ['algorithm'],
  'machine learning': ['machine learning', 'deep learning', 'ai', 'ml'],
  ia: ['machine learning', 'deep learning', 'ai', 'ml'],
  ciberseguridad: ['cybersecurity', 'security'],
  seguridad: ['cybersecurity', 'security'],
  devops: ['devops', 'docker'],
  cloud: ['cloud', 'aws', 'azure'],
  frontend: ['react', 'javascript', 'html', 'css', 'frontend', 'web'],
  backend: ['node.js', 'python', 'sql', 'database', 'backend'],
  web: ['html', 'css', 'frontend', 'web', 'javascript'],
  data: ['sql', 'data', 'machine learning'],
  algorithms: ['algorithm', 'data structure'],
  estructura: ['algorithm', 'data structure'],
}

function extractKeywords(text: string): string[] {
  return text.toLowerCase().split(/[\s,()]+/).filter(Boolean)
}

export function getRelatedResources(topicName: string, limit = 3): CuratedResource[] {
  const keywords = extractKeywords(topicName)
  const searchTerms = new Set<string>()

  for (const kw of keywords) {
    if (keywordMap[kw]) {
      for (const term of keywordMap[kw]) {
        searchTerms.add(term)
      }
    } else {
      searchTerms.add(kw)
    }
  }

  const scored = curatedResources.map((r) => {
    const title = r.title.toLowerCase()
    const desc = r.description.toLowerCase()
    let score = 0

    for (const term of searchTerms) {
      if (title.includes(term)) score += 3
      if (desc.includes(term)) score += 2
    }

    if (r.category === 'tecnologia') score += 0.5

    return { resource: r, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.resource)
}
