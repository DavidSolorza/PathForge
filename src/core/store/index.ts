import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User,
  Skill,
  LearningPath,
  Stage,
  Project,
  Recommendation,
  ChatMessage,
  UserStats,
} from '@shared/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'pathforge-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

interface UserState {
  skills: Skill[]
  stats: UserStats | null
  loading: boolean
  setSkills: (skills: Skill[]) => void
  setStats: (stats: UserStats) => void
  setLoading: (loading: boolean) => void
  updateSkill: (skillId: string, updates: Partial<Skill>) => void
}

export const useUserStore = create<UserState>()((set) => ({
  skills: [],
  stats: null,
  loading: false,
  setSkills: (skills) => set({ skills }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  updateSkill: (skillId, updates) =>
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === skillId ? { ...s, ...updates } : s,
      ),
    })),
}))

interface PathState {
  paths: LearningPath[]
  activePath: LearningPath | null
  loading: boolean
  setPaths: (paths: LearningPath[]) => void
  setActivePath: (path: LearningPath | null) => void
  setLoading: (loading: boolean) => void
  updateStage: (pathId: string, stageId: string, updates: Partial<Stage>) => void
}

export const usePathStore = create<PathState>()((set) => ({
  paths: [],
  activePath: null,
  loading: false,
  setPaths: (paths) => set({ paths }),
  setActivePath: (path) => set({ activePath: path }),
  setLoading: (loading) => set({ loading }),
  updateStage: (pathId, stageId, updates) =>
    set((state) => ({
      paths: state.paths.map((p) =>
        p.id === pathId
          ? {
              ...p,
              stages: p.stages.map((s) =>
                s.id === stageId ? { ...s, ...updates } : s,
              ),
            }
          : p,
      ),
      activePath:
        state.activePath?.id === pathId && state.activePath
          ? {
              ...state.activePath,
              stages: state.activePath.stages.map((s) =>
                s.id === stageId ? { ...s, ...updates } : s,
              ),
            }
          : state.activePath,
    })),
}))

interface ProjectState {
  projects: Project[]
  loading: boolean
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projects: [],
  loading: false,
  setProjects: (projects) => set({ projects }),
  setLoading: (loading) => set({ loading }),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates } : p,
      ),
    })),
}))

interface RecommendationState {
  recommendations: Recommendation[]
  chatMessages: ChatMessage[]
  loading: boolean
  setRecommendations: (recommendations: Recommendation[]) => void
  setChatMessages: (messages: ChatMessage[]) => void
  addChatMessage: (message: ChatMessage) => void
  setLoading: (loading: boolean) => void
}

export const useRecommendationStore = create<RecommendationState>()((set) => ({
  recommendations: [],
  chatMessages: [],
  loading: false,
  setRecommendations: (recommendations) => set({ recommendations }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setLoading: (loading) => set({ loading }),
}))

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'pathforge-ui' },
  ),
)
