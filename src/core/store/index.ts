import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LearningPath, Project, ChatMessage, UserStats } from '@shared/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
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
    { name: 'pathforge_auth' },
  ),
)

interface PathState {
  paths: LearningPath[]
  activePath: LearningPath | null
  loading: boolean
  setPaths: (paths: LearningPath[]) => void
  setActivePath: (path: LearningPath | null) => void
  toggleTopic: (pathId: string, stageId: string, topicId: string) => void
  addPath: (path: LearningPath) => void
  setLoading: (loading: boolean) => void
}

export const usePathStore = create<PathState>()((set) => ({
  paths: [],
  activePath: null,
  loading: false,
  setPaths: (paths) => set({ paths }),
  setActivePath: (path) => set({ activePath: path }),
  toggleTopic: (pathId, stageId, topicId) =>
    set((state) => ({
      paths: state.paths.map((p) =>
        p.id === pathId
          ? {
              ...p,
              stages: p.stages.map((s) =>
                s.id === stageId
                  ? {
                      ...s,
                      topics: s.topics.map((t) =>
                        t.id === topicId ? { ...t, completed: !t.completed } : t,
                      ),
                      status: s.topics.every((t) => t.id === topicId ? !t.completed : t.completed)
                        ? 'completed'
                        : s.topics.some((t) => t.id === topicId ? !t.completed : t.completed)
                          ? 'in_progress'
                          : 'pending',
                    }
                  : s,
              ),
              progress: Math.round(
                (p.stages.flatMap((s) =>
                  s.id === stageId
                    ? s.topics.map((t) => (t.id === topicId ? !t.completed : t.completed))
                    : s.topics.map((t) => t.completed),
                ).filter(Boolean).length /
                  p.stages.flatMap((s) => s.topics).length) *
                  100,
              ),
            }
          : p,
      ),
      activePath: state.activePath?.id === pathId
        ? {
            ...state.activePath,
            stages: state.activePath.stages.map((s) =>
              s.id === stageId
                ? {
                    ...s,
                    topics: s.topics.map((t) =>
                      t.id === topicId ? { ...t, completed: !t.completed } : t,
                    ),
                  }
                : s,
            ),
          }
        : state.activePath,
    })),
  addPath: (path) => set((state) => ({ paths: [path, ...state.paths] })),
  setLoading: (loading) => set({ loading }),
}))

interface ProjectState {
  projects: Project[]
  loading: boolean
  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projects: [],
  loading: false,
  setProjects: (projects) => set({ projects }),
  setLoading: (loading) => set({ loading }),
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
}))

interface ChatState {
  messages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  setMessages: (msgs: ChatMessage[]) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg].slice(-50) })),
      setMessages: (msgs) => set({ messages: msgs }),
      clearMessages: () => set({ messages: [] }),
    }),
    { name: 'pathforge_chat' },
  ),
)

interface StatsState {
  stats: UserStats
  setStats: (stats: UserStats) => void
  updateStats: (updates: Partial<UserStats>) => void
}

const DEFAULT_STATS: UserStats = {
  totalPaths: 0,
  completedTopics: 0,
  totalProgress: 0,
  streak: 0,
  favoriteCategory: '',
  activeDays: 0,
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      stats: { ...DEFAULT_STATS },
      setStats: (stats) => set({ stats: { ...DEFAULT_STATS, ...stats } }),
      updateStats: (updates) =>
        set((state) => ({ stats: { ...state.stats, ...updates } })),
    }),
    {
      name: 'pathforge_stats',
      merge: (persisted, current) => ({
        ...current,
        stats: { ...DEFAULT_STATS, ...(persisted as any)?.stats },
      }),
    },
  ),
)

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
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'pathforge_ui' },
  ),
)
