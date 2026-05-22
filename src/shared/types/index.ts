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
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
  completedAt?: string
  resources: Resource[]
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

export interface UserStats {
  totalPaths: number
  completedTopics: number
  totalProgress: number
  streak: number
  favoriteCategory: string
  activeDays: number
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

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'tecnologia', label: 'Tecnología', emoji: '💻' },
  { value: 'idiomas', label: 'Idiomas', emoji: '🌍' },
  { value: 'diseno', label: 'Diseño', emoji: '🎨' },
  { value: 'musica', label: 'Música', emoji: '🎵' },
  { value: 'arte', label: 'Arte', emoji: '🖼️' },
  { value: 'negocios', label: 'Negocios', emoji: '💼' },
  { value: 'productividad', label: 'Productividad', emoji: '⚡' },
  { value: 'ciencias', label: 'Ciencias', emoji: '🔬' },
  { value: 'cocina', label: 'Cocina', emoji: '🍳' },
  { value: 'fotografia', label: 'Fotografía', emoji: '📷' },
  { value: 'deportes', label: 'Deportes', emoji: '🏃' },
  { value: 'otros', label: 'Otros', emoji: '📚' },
]
