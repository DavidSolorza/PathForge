import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderGit2, ExternalLink, GitBranch } from 'lucide-react'
import { useProjectStore } from '@core/store'
import { ProjectService } from '../services'
import type { Project } from '@shared/types'
import { Card, CardHeader, CardContent, CardFooter } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { LoadingState } from '@shared/components/ui/LoadingState'
import { ErrorState } from '@shared/components/ui/ErrorState'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'

const statusVariant = {
  draft: 'default' as const,
  in_progress: 'warning' as const,
  completed: 'success' as const,
  archived: 'default' as const,
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  in_progress: 'En progreso',
  completed: 'Completado',
  archived: 'Archivado',
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
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
            <h3 className="text-sm font-semibold text-neutral-900">
              {project.name}
            </h3>
            <p className="text-xs text-neutral-400 truncate">
              {project.description}
            </p>
          </div>
          <Badge variant={statusVariant[project.status]}>
            {statusLabels[project.status]}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
              >
                {tech}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors no-underline"
            >
                <GitBranch className="h-3.5 w-3.5" />
              Repositorio
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors no-underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Demo
            </a>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export function ProjectsPage() {
  const { projects, loading, setProjects, setLoading } = useProjectStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await ProjectService.getAll()
        setProjects(data)
      } catch {
        setError('Error al cargar proyectos')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (loading) return <LoadingState message="Cargando proyectos..." />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderGit2 className="h-8 w-8" />}
        title="Sin proyectos"
        description="Los proyectos que crees aparecerán aquí"
        action={<Button>Crear proyecto</Button>}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Proyectos</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {projects.length} proyectos
          </p>
        </div>
        <Button>Nuevo proyecto</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </div>
  )
}
