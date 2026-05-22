import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderGit2, ExternalLink, GitBranch, Plus, Pencil, Trash2 } from 'lucide-react'
import { useProjectStore } from '@core/store'
import { ProjectStorageService } from '../services/ProjectStorageService'
import { ProjectModal } from '../components/ProjectModal'
import type { Project } from '@shared/types'
import { Card, CardHeader, CardContent, CardFooter } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { LoadingState } from '@shared/components/ui/LoadingState'
import { ErrorState } from '@shared/components/ui/ErrorState'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'
import { useToastStore } from '@shared/store/toastStore'

const statusVariant: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  draft: 'default',
  in_progress: 'warning',
  completed: 'success',
  archived: 'default',
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  in_progress: 'En progreso',
  completed: 'Completado',
  archived: 'Archivado',
}

function ProjectCard({ project, index, onEdit, onDelete }: { project: Project; index: number; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card hover>
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900">{project.name}</h3>
            <p className="text-xs text-neutral-400 truncate">{project.description}</p>
          </div>
          <Badge variant={statusVariant[project.status]}>{statusLabels[project.status]}</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span key={tech} className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{tech}</span>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-3 flex-1">
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors no-underline">
                  <GitBranch className="h-3.5 w-3.5" /> Repositorio
                </a>
              )}
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors no-underline">
                  <ExternalLink className="h-3.5 w-3.5" /> Demo
                </a>
              )}
            </div>
            <button onClick={() => onEdit(project.id)} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Editar">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onDelete(project.id)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export function ProjectsPage() {
  const { projects, loading, setProjects, setLoading } = useProjectStore()
  const addToast = useToastStore((s) => s.addToast)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | undefined>(undefined)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    try {
      setLoading(true)
      setError(null)
      setProjects(ProjectStorageService.getAll())
    } catch {
      setError('Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreate = () => {
    setEditId(undefined)
    setModalOpen(true)
  }

  const handleEdit = (id: string) => {
    setEditId(id)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      ProjectStorageService.remove(id)
      setProjects(ProjectStorageService.getAll())
      setDeleteConfirm(null)
      addToast('success', 'Proyecto eliminado')
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  if (loading) return <LoadingState message="Cargando proyectos..." />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  return (
    <div className="space-y-8">
      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} editId={editId} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Proyectos</h1>
          <p className="text-sm text-neutral-500 mt-1">{projects.length} proyectos</p>
        </div>
        <Button onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>Nuevo proyecto</Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-8 w-8" />}
          title="Sin proyectos"
          description="Los proyectos que crees apareceran aqui"
          action={<Button onClick={handleCreate}>Crear proyecto</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-red-200 bg-red-50 px-6 py-3 shadow-lg flex items-center gap-3">
          <p className="text-sm text-red-700">Confirma que deseas eliminar este proyecto</p>
          <button onClick={() => handleDelete(deleteConfirm)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors">Eliminar</button>
          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Cancelar</button>
        </div>
      )}
    </div>
  )
}
