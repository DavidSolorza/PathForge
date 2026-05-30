export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  favoriteCategories: string[]
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  name: string
  content?: string
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
  completedAt?: string
  resources: Resource[]
  notes?: string
  reviewDueAt?: string
  reviewInterval?: number
}

export interface PathPreferences {
  weeklyHours: '<3' | '3-5' | '5-10' | '10+'
  learningMethod: 'lectura' | 'video' | 'practica' | 'mixto'
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
  projectPreference: 'cortos' | 'medianos' | 'largos'
}

export interface Stage {
  id: string
  name: string
  description: string
  order: number
  status: 'pending' | 'in_progress' | 'completed'
  topics: Topic[]
}

export interface LearningPath {
  id: string
  title: string
  goal: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  stages: Stage[]
  createdAt: string
  updatedAt: string
}

export interface Resource {
  id: string
  title: string
  type: 'video' | 'article' | 'documentation' | 'book' | 'practice'
  url: string
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  repoUrl?: string
  demoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Recommendation {
  id: string
  type: 'next_topic' | 'resource' | 'project' | 'tip'
  title: string
  description: string
  reason: string
  pathId?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface StudySession {
  date: string
  duration: number
  topicsStudied: string[]
}

export interface LearningGoal {
  id: string
  type: 'weekly_topics' | 'weekly_sessions' | 'custom'
  target: number
  current: number
  weekStart: string
  label: string
}

export interface CuratedResource {
  id: string
  title: string
  url: string
  description: string
  type: 'course' | 'book' | 'documentation' | 'practice' | 'video' | 'article'
  category: string
  free: boolean
  author?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface UserStats {
  totalPaths: number
  completedTopics: number
  totalProgress: number
  streak: number
  favoriteCategory: string
  activeDays: number
  longestStreak: number
}

export interface RecentActivity {
  id: string
  type: 'path_created' | 'topic_completed' | 'path_completed'
  title: string
  pathName: string
  timestamp: string
}

export type Category =
  | 'tecnologia'
  | 'idiomas'
  | 'diseno'
  | 'musica'
  | 'arte'
  | 'negocios'
  | 'productividad'
  | 'ciencias'
  | 'cocina'
  | 'fotografia'
  | 'deportes'
  | 'otros'

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'idiomas', label: 'Idiomas' },
  { value: 'diseno', label: 'Diseño' },
  { value: 'musica', label: 'Música' },
  { value: 'arte', label: 'Arte' },
  { value: 'negocios', label: 'Negocios' },
  { value: 'productividad', label: 'Productividad' },
  { value: 'ciencias', label: 'Ciencias' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'fotografia', label: 'Fotografía' },
  { value: 'deportes', label: 'Deportes' },
  { value: 'otros', label: 'Otros' },
]
