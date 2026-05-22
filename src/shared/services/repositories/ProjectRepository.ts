import { BaseRepository } from '../BaseRepository'
import type { Project } from '@shared/types'

class ProjectRepositoryImpl extends BaseRepository<Project> {
  constructor() {
    super('projects')
  }

  create(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const items = this.getAll()
    const now = new Date().toISOString()
    const newItem: Project = {
      ...input,
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    }
    items.push(newItem)
    this.saveAll(items)
    return newItem
  }

  update(id: string, updates: Partial<Project>): Project | undefined {
    const items = this.getAll()
    const idx = items.findIndex((item) => item.id === id)
    if (idx === -1) return undefined
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() }
    this.saveAll(items)
    return items[idx]
  }

  getByStatus(status: Project['status']): Project[] {
    return this.getAll().filter((p) => p.status === status)
  }
}

export const ProjectRepository = new ProjectRepositoryImpl()
