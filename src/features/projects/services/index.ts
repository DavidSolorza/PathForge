import { LocalDB } from '@shared/lib/db'
import type { Project } from '@shared/types'

export const ProjectService = {
  async getAll(): Promise<Project[]> {
    await new Promise((r) => setTimeout(r, 200))
    return LocalDB.getProjects()
  },

  async getById(id: string): Promise<Project | undefined> {
    await new Promise((r) => setTimeout(r, 200))
    return LocalDB.getProjects().find((p) => p.id === id)
  },

  async create(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    await new Promise((r) => setTimeout(r, 300))
    const project: Project = {
      ...input,
      id: 'p' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return LocalDB.addProject(project)
  },

  async update(id: string, updates: Partial<Project>): Promise<void> {
    await new Promise((r) => setTimeout(r, 200))
    LocalDB.updateProject(id, updates)
  },

  async remove(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200))
    LocalDB.deleteProject(id)
  },
}
