import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderGit2, Plus, Pencil, Trash2, ChevronDown, ChevronUp, StickyNote, Calendar, Clock, Globe, Tag, GitBranch } from 'lucide-react'
import { useProjectStore } from '@core/store'
import { ProjectStorageService } from '../services/ProjectStorageService'
import { ProjectModal } from '../components/ProjectModal'
import type { Project } from '@shared/types'
import { Card, CardHeader, CardContent, CardFooter } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Progress } from '@shared/components/ui/Progress'
import { LoadingState } from '@shared/components/ui/LoadingState'
import { ErrorState } from '@shared/components/ui/ErrorState'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'
import { useToastStore } from '@shared/store/toastStore'
import { cn, formatDate } from '@shared/lib/utils'

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

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  archived: 'bg-neutral-100 text-neutral-500 border-neutral-200',
}

function ProjectCard({ project, index, onEdit, onDelete }: { project: Project; index: number; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(project.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const addToast = useToastStore((s) => s.addToast)

  const saveNotes = async (value: string) => {
    setSavingNotes(true)
    await ProjectStorageService.update(project.id, { notes: value })
    setSavingNotes(false)
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveNotes(value), 800)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
    >
      <Card hover className={cn('transition-all duration-200', expanded && 'ring-1 ring-gold/20')}>
        <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <CardHeader>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 shadow-xs flex-shrink-0">
              <FolderGit2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-neutral-900 truncate">{project.name}</h3>
              <p className="text-xs text-neutral-400 truncate">{project.description}</p>
            </div>
            <span className={cn('inline-flex items-center rounded-full border px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium flex-shrink-0', statusColors[project.status])}>
              {statusLabels[project.status]}
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span key={tech} className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 border border-neutral-200/60">
                  {tech}
                </span>
              ))}
              {project.technologies.length === 0 && (
                <span className="text-xs text-neutral-400">Sin tecnologias registradas</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Progreso</span>
                <span className={cn(
                  'text-xs font-semibold',
                  project.progress >= 100 ? 'text-green-600' : 'text-gold-dark'
                )}>{project.progress ?? 0}%</span>
              </div>
              <Progress value={project.progress ?? 0} size="sm" />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-1.5 sm:gap-2 w-full flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-neutral-500 hover:text-gold-dark transition-colors no-underline truncate">
                    <GitBranch className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" /> <span className="hidden sm:inline">Repositorio</span><span className="sm:hidden">Repo</span>
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-neutral-500 hover:text-gold-dark transition-colors no-underline truncate">
                    <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" /> Demo
                  </a>
                )}
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                {project.notes && <StickyNote className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold" />}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                  className="p-1 sm:p-1.5 text-neutral-400 hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
                  title="Ver detalle"
                >
                  {expanded ? <ChevronUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); onEdit(project.id) }} className="p-1 sm:p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Editar">
                  <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(project.id) }} className="p-1 sm:p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                  <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            </div>
          </CardFooter>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-t border-neutral-100/80 px-3 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    <span>Creado: <strong className="text-neutral-700 font-medium">{formatDate(project.createdAt)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="h-3.5 w-3.5 text-gold" />
                    <span>Actualizado: <strong className="text-neutral-700 font-medium">{formatDate(project.updatedAt)}</strong></span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Descripcion</p>
                  <p className="text-sm text-neutral-700 leading-relaxed">{project.description}</p>
                </div>

                {project.technologies.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Tecnologias</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="inline-flex items-center gap-1 rounded-lg bg-primary-50 border border-primary-200/60 px-2.5 py-1 text-xs font-medium text-primary-700">
                          <Tag className="h-3 w-3" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Progreso</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={project.progress ?? 0} size="md" />
                    </div>
                    <span className={cn('text-sm font-bold', project.progress >= 100 ? 'text-green-600' : 'text-gold-dark')}>{project.progress ?? 0}%</span>
                  </div>
                </div>

                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-primary-600 hover:text-gold-dark transition-colors no-underline break-all">
                    <GitBranch className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    {project.repoUrl}
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-primary-600 hover:text-gold-dark transition-colors no-underline break-all">
                    <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    {project.demoUrl}
                  </a>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mis apuntes</p>
                    {savingNotes && <span className="text-[10px] text-neutral-400 animate-pulse-soft">Guardando...</span>}
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Escribe tus apuntes, ideas o recursos sobre este proyecto..."
                    rows={4}
                    className="w-full rounded-xl border border-neutral-200/80 bg-white px-3.5 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 resize-y transition-all duration-200"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        setProjects(await ProjectStorageService.getAll())
      } catch {
        setError('Error al cargar proyectos')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleCreate = () => {
    setEditId(undefined)
    setModalOpen(true)
  }

  const handleEdit = (id: string) => {
    setEditId(id)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    await ProjectStorageService.remove(id)
    setProjects(await ProjectStorageService.getAll())
    addToast('success', 'Proyecto eliminado')
  }

  if (loading) return <LoadingState message="Cargando proyectos..." />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-8"
    >
      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} editId={editId} />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3 sm:gap-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary-700 via-primary-600 to-gold bg-clip-text text-transparent">
              Proyectos
            </h1>
            {projects.length > 0 && (
              <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/5 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-gold-dark">
                {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 sm:mt-1.5 ml-0.5">
            Gestiona tus proyectos personales y sigue tu progreso
          </p>
        </div>
        <Button onClick={handleCreate} icon={<Plus className="h-4 w-4" />} className="flex-shrink-0">
          <span className="hidden sm:inline">Nuevo </span>proyecto
        </Button>
      </motion.div>

      {projects.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <EmptyState
            icon={
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <FolderGit2 className="h-10 w-10" />
              </motion.div>
            }
            title="Sin proyectos"
            description="Los proyectos que crees apareceran aqui. Crea tu primer proyecto para empezar."
            action={<Button onClick={handleCreate}>Crear proyecto</Button>}
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
