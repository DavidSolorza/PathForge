import { LocalStorageService } from '@shared/services/LocalStorageService'
import type { Project } from '@shared/types'

const PROJECTS_KEY = 'projects'

export const ProjectStorageService = {
  getAll(): Project[] {
    return LocalStorageService.get<Project[]>(PROJECTS_KEY) || []
  },

  getById(id: string): Project | undefined {
    return this.getAll().find((p) => p.id === id)
  },

  save(project: Project): void {
    LocalStorageService.update<Project[]>(PROJECTS_KEY, (prev) => {
      const list = prev || []
      const idx = list.findIndex((p) => p.id === project.id)
      if (idx >= 0) list[idx] = project
      else list.push(project)
      return list
    })
  },

  create(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const project: Project = {
      ...input,
      id: 'proj_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.save(project)
    return project
  },

  update(id: string, updates: Partial<Project>): Project | undefined {
    const project = this.getById(id)
    if (!project) return undefined
    Object.assign(project, updates, { updatedAt: new Date().toISOString() })
    this.save(project)
    return project
  },

  remove(id: string): void {
    LocalStorageService.update<Project[]>(PROJECTS_KEY, (prev) => (prev || []).filter((p) => p.id !== id))
  },
}
