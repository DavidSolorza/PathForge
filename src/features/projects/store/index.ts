import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '@shared/types'
import { ProjectStorageService } from '../services/ProjectStorageService'

interface ProjectState {
  projects: Project[]
  loading: boolean
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  refresh: () => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      loading: false,
      setProjects: (projects) => set({ projects }),
      setLoading: (loading) => set({ loading }),
      refresh: () => {
        set({ projects: ProjectStorageService.getAll() })
      },
    }),
    { name: 'pathforge_projects' },
  ),
)
