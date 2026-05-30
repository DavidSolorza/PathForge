import type { DbAdapter } from '@shared/services/DbAdapter'
import { LocalStorageAdapter } from '@shared/services/LocalStorageAdapter'
import type { Project } from '@shared/types'

const PROJECTS_KEY = 'projects'
let _adapter: DbAdapter = LocalStorageAdapter

export function setProjectAdapter(adapter: DbAdapter): void {
  _adapter = adapter
}

export const ProjectStorageService = {
  async getAll(): Promise<Project[]> {
    return (await _adapter.get<Project[]>(PROJECTS_KEY)) || []
  },

  async getById(id: string): Promise<Project | undefined> {
    const all = await this.getAll()
    return all.find((p) => p.id === id)
  },

  async save(project: Project): Promise<void> {
    await _adapter.update<Project[]>(PROJECTS_KEY, (prev) => {
      const list = prev || []
      const idx = list.findIndex((p) => p.id === project.id)
      if (idx >= 0) list[idx] = project
      else list.push(project)
      return list
    })
  },

  async create(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project: Project = {
      ...input,
      progress: input.progress ?? 0,
      id: 'proj_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await this.save(project)
    return project
  },

  async update(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = await this.getById(id)
    if (!project) return undefined
    Object.assign(project, updates, { updatedAt: new Date().toISOString() })
    await this.save(project)
    return project
  },

  async remove(id: string): Promise<void> {
    await _adapter.update<Project[]>(PROJECTS_KEY, (prev) => (prev || []).filter((p) => p.id !== id))
  },
}
