import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { ProjectStorageService } from '@features/projects/services/ProjectStorageService'
import { StudyService } from '@features/learning-path/services/StudyService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { QuickNotesService } from '@features/profile/services/QuickNotesService'
import type { LearningPath, Project, StudySession, UserStats, RecentActivity, QuickNote } from '@shared/types'

interface ExportData {
  version: string
  exportedAt: string
  paths: LearningPath[]
  projects: Project[]
  sessions: StudySession[]
  stats: UserStats
  activities: RecentActivity[]
  notes: QuickNote[]
}

export const DataExportService = {
  async exportAllData(): Promise<string> {
    const paths = await PathStorageService.getAll()
    const projects = await ProjectStorageService.getAll()
    const sessions = StudyService.getSessions()
    const stats = await UserStorageService.getStats()
    const activities = await UserStorageService.getActivity()
    const notes = QuickNotesService.getAll()

    const exportData: ExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      paths,
      projects,
      sessions,
      stats,
      activities: activities as RecentActivity[],
      notes
    }

    return JSON.stringify(exportData, null, 2)
  },

  downloadExport(): void {
    this.exportAllData().then((data) => {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pathforge-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  },

  async importData(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const text = await file.text()
      const data: ExportData = JSON.parse(text)

      if (!data.version || !data.exportedAt) {
        return { success: false, message: 'Archivo de backup inválido' }
      }

      if (data.paths && Array.isArray(data.paths)) {
        for (const path of data.paths) {
          await PathStorageService.save(path)
        }
      }

      if (data.projects && Array.isArray(data.projects)) {
        for (const project of data.projects) {
          await ProjectStorageService.save(project)
        }
      }

      if (data.sessions && Array.isArray(data.sessions)) {
        const existingSessions = StudyService.getSessions()
        const newSessions = data.sessions.filter(
          s => !existingSessions.some(es => es.date === s.date)
        )
        if (newSessions.length > 0) {
          localStorage.setItem('pathforge_study', JSON.stringify({
            sessions: [...existingSessions, ...newSessions],
            lastCheckIn: newSessions[newSessions.length - 1]?.date || null
          }))
        }
      }

      if (data.stats) {
        await UserStorageService.updateStats(() => data.stats)
      }

      if (data.activities && Array.isArray(data.activities)) {
        const existingActivities = await UserStorageService.getActivity()
        const newActivities = data.activities.filter(
          a => !existingActivities.some(ea => ea.id === a.id)
        )
        for (const activity of newActivities) {
          await UserStorageService.addActivity(activity)
        }
      }

      if (data.notes && Array.isArray(data.notes)) {
        for (const note of data.notes) {
          QuickNotesService.create(note.content)
        }
      }

      return {
        success: true,
        message: `Datos importados: ${data.paths?.length || 0} rutas, ${data.projects?.length || 0} proyectos, ${data.notes?.length || 0} notas`
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error al importar datos: archivo corrupto o formato inválido'
      }
    }
  }
}
