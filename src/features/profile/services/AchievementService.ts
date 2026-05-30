import type { Achievement } from '@shared/types'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { ProjectStorageService } from '@features/projects/services/ProjectStorageService'
import { StudyService } from '@features/learning-path/services/StudyService'

const STORAGE_KEY = 'pathforge_achievements'

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_topic',
    title: 'Primer Paso',
    description: 'Completa tu primer tema',
    icon: '🎯',
    category: 'learning',
    condition: { type: 'topics_completed', target: 1 }
  },
  {
    id: 'ten_topics',
    title: 'Estudiante Dedicado',
    description: 'Completa 10 temas',
    icon: '📚',
    category: 'learning',
    condition: { type: 'topics_completed', target: 10 }
  },
  {
    id: 'fifty_topics',
    title: 'Conocedor',
    description: 'Completa 50 temas',
    icon: '🧠',
    category: 'learning',
    condition: { type: 'topics_completed', target: 50 }
  },
  {
    id: 'hundred_topics',
    title: 'Maestro del Aprendizaje',
    description: 'Completa 100 temas',
    icon: '👑',
    category: 'milestone',
    condition: { type: 'topics_completed', target: 100 }
  },
  {
    id: 'first_path',
    title: 'Explorador',
    description: 'Completa tu primera ruta de aprendizaje',
    icon: '🗺️',
    category: 'learning',
    condition: { type: 'paths_completed', target: 1 }
  },
  {
    id: 'three_paths',
    title: 'Aventurero',
    description: 'Completa 3 rutas de aprendizaje',
    icon: '⚔️',
    category: 'learning',
    condition: { type: 'paths_completed', target: 3 }
  },
  {
    id: 'five_paths',
    title: 'Veterano',
    description: 'Completa 5 rutas de aprendizaje',
    icon: '🏆',
    category: 'milestone',
    condition: { type: 'paths_completed', target: 5 }
  },
  {
    id: 'streak_3',
    title: 'Constante',
    description: 'Mantén una racha de 3 días',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'streak_days', target: 3 }
  },
  {
    id: 'streak_7',
    title: 'Semana Perfecta',
    description: 'Mantén una racha de 7 días',
    icon: '⚡',
    category: 'streak',
    condition: { type: 'streak_days', target: 7 }
  },
  {
    id: 'streak_30',
    title: 'Mes Legendario',
    description: 'Mantén una racha de 30 días',
    icon: '💎',
    category: 'milestone',
    condition: { type: 'streak_days', target: 30 }
  },
  {
    id: 'minutes_60',
    title: 'Primera Hora',
    description: 'Estudia 60 minutos en total',
    icon: '⏱️',
    category: 'learning',
    condition: { type: 'total_minutes', target: 60 }
  },
  {
    id: 'minutes_300',
    title: 'Maratonista',
    description: 'Estudia 5 horas en total',
    icon: '🏃',
    category: 'learning',
    condition: { type: 'total_minutes', target: 300 }
  },
  {
    id: 'minutes_1000',
    title: 'Experto en Formación',
    description: 'Estudia más de 16 horas en total',
    icon: '🎓',
    category: 'milestone',
    condition: { type: 'total_minutes', target: 1000 }
  },
  {
    id: 'first_project',
    title: 'Constructor',
    description: 'Completa tu primer proyecto',
    icon: '🛠️',
    category: 'learning',
    condition: { type: 'projects_completed', target: 1 }
  },
  {
    id: 'three_projects',
    title: 'Arquitecto',
    description: 'Completa 3 proyectos',
    icon: '🏗️',
    category: 'learning',
    condition: { type: 'projects_completed', target: 3 }
  },
  {
    id: 'five_projects',
    title: 'Ingeniero Senior',
    description: 'Completa 5 proyectos',
    icon: '🌟',
    category: 'milestone',
    condition: { type: 'projects_completed', target: 5 }
  }
]

function load(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(achievements: Achievement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements))
}

export const AchievementService = {
  getAll(): Achievement[] {
    return ACHIEVEMENTS
  },

  getUnlocked(): Achievement[] {
    return load()
  },

  async checkAndUnlock(): Promise<Achievement[]> {
    const unlocked = load()
    const newlyUnlocked: Achievement[] = []

    const paths = await PathStorageService.getAll()
    const completedTopics = paths.reduce((sum, p) =>
      sum + p.stages.flatMap(s => s.topics).filter(t => t.completed).length, 0
    )
    const completedPaths = paths.filter(p => p.progress === 100).length
    const streak = StudyService.getStreak()
    const totalMinutes = StudyService.getTotalMinutes()

    const projects = await ProjectStorageService.getAll()
    const completedProjects = projects.filter(p => p.status === 'completed').length

    for (const achievement of ACHIEVEMENTS) {
      const alreadyUnlocked = unlocked.find(a => a.id === achievement.id)
      if (alreadyUnlocked) continue

      let currentValue = 0
      switch (achievement.condition.type) {
        case 'topics_completed':
          currentValue = completedTopics
          break
        case 'paths_completed':
          currentValue = completedPaths
          break
        case 'streak_days':
          currentValue = streak
          break
        case 'total_minutes':
          currentValue = totalMinutes
          break
        case 'projects_completed':
          currentValue = completedProjects
          break
      }

      if (currentValue >= achievement.condition.target) {
        const unlockedAchievement: Achievement = {
          ...achievement,
          unlockedAt: new Date().toISOString()
        }
        unlocked.push(unlockedAchievement)
        newlyUnlocked.push(unlockedAchievement)
      }
    }

    if (newlyUnlocked.length > 0) {
      save(unlocked)
    }

    return newlyUnlocked
  },

  getProgress(achievement: Achievement): { current: number; target: number; percentage: number } {
    const paths = PathStorageService.getAllSync()
    const completedTopics = paths.reduce((sum, p) =>
      sum + p.stages.flatMap(s => s.topics).filter(t => t.completed).length, 0
    )
    const completedPaths = paths.filter(p => p.progress === 100).length
    const streak = StudyService.getStreak()
    const totalMinutes = StudyService.getTotalMinutes()

    const projects = ProjectStorageService.getAllSync()
    const completedProjects = projects.filter(p => p.status === 'completed').length

    let current = 0
    switch (achievement.condition.type) {
      case 'topics_completed':
        current = completedTopics
        break
      case 'paths_completed':
        current = completedPaths
        break
      case 'streak_days':
        current = streak
        break
      case 'total_minutes':
        current = totalMinutes
        break
      case 'projects_completed':
        current = completedProjects
        break
    }

    const target = achievement.condition.target
    const percentage = Math.min(100, Math.round((current / target) * 100))

    return { current, target, percentage }
  }
}
