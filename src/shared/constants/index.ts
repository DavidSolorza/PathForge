import type { Goal } from '@shared/types'

export const GOAL_LABELS: Record<Goal, string> = {
  aprender_python: 'Aprender Python',
  backend_developer: 'Backend Developer',
  inteligencia_artificial: 'Inteligencia Artificial',
  desarrollo_web: 'Desarrollo Web',
  ciberseguridad: 'Ciberseguridad',
  data_science: 'Data Science',
}

export const GOAL_ICONS: Record<Goal, string> = {
  aprender_python: '🐍',
  backend_developer: '⚙️',
  inteligencia_artificial: '🤖',
  desarrollo_web: '🌐',
  ciberseguridad: '🔒',
  data_science: '📊',
}

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Principiante', color: 'bg-blue-100 text-blue-700' },
  { value: 'intermediate', label: 'Intermedio', color: 'bg-amber-100 text-amber-700' },
  { value: 'advanced', label: 'Avanzado', color: 'bg-green-100 text-green-700' },
  { value: 'expert', label: 'Experto', color: 'bg-purple-100 text-purple-700' },
] as const

export const STAGE_STATUS = {
  locked: { label: 'Bloqueado', color: 'bg-neutral-100 text-neutral-400' },
  available: { label: 'Disponible', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En progreso', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
} as const

export const PROJECT_STATUS = {
  draft: { label: 'Borrador', color: 'bg-neutral-100 text-neutral-500' },
  in_progress: { label: 'En progreso', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archivado', color: 'bg-neutral-100 text-neutral-400' },
} as const

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Mi Ruta', path: '/learning-path', icon: 'Map' },
  { label: 'Habilidades', path: '/skills', icon: 'Zap' },
  { label: 'Proyectos', path: '/projects', icon: 'FolderGit2' },
  { label: 'Asistente IA', path: '/ai-assistant', icon: 'Bot' },
  { label: 'Perfil', path: '/profile', icon: 'User' },
] as const
