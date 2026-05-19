export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: string
  name: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  progress: number
  experience: number
  icon?: string
}

export interface LearningPath {
  id: string
  goal: string
  stages: Stage[]
  progress: number
  createdAt: string
  updatedAt: string
}

export interface Stage {
  id: string
  name: string
  description: string
  order: number
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  progress: number
  technologies: string[]
  resources: Resource[]
}

export interface Resource {
  id: string
  title: string
  type: 'video' | 'article' | 'course' | 'book' | 'project'
  url: string
  completed: boolean
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
  type: 'skill' | 'project' | 'resource' | 'next_step'
  title: string
  description: string
  relevance: number
  reason: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface UserStats {
  totalSkills: number
  completedProjects: number
  totalProgress: number
  learningStreak: number
  hoursLearned: number
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export type Goal =
  | 'aprender_python'
  | 'backend_developer'
  | 'inteligencia_artificial'
  | 'desarrollo_web'
  | 'ciberseguridad'
  | 'data_science'
