import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Map,
  CheckCircle2,
  Lock,
  PlayCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import { usePathStore } from '@core/store'
import { LearningPathService } from '../services'
import type { Stage } from '@shared/types'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Progress } from '@shared/components/ui/Progress'
import { LoadingState } from '@shared/components/ui/LoadingState'
import { ErrorState } from '@shared/components/ui/ErrorState'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'

const stageIcons = {
  locked: Lock,
  available: PlayCircle,
  in_progress: BookOpen,
  completed: CheckCircle2,
}

const stageColors = {
  locked: 'text-neutral-300 border-neutral-200 bg-neutral-50',
  available: 'text-primary-500 border-primary-200 bg-primary-50',
  in_progress: 'text-amber-500 border-amber-200 bg-amber-50',
  completed: 'text-green-500 border-green-200 bg-green-50',
}

export function LearningPathPage() {
  const { paths, activePath, loading, setPaths, setActivePath, setLoading } =
    usePathStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await LearningPathService.getAll()
        setPaths(data)
        if (data.length > 0) {
          setActivePath(data[0])
        }
      } catch {
        setError('Error al cargar las rutas de aprendizaje')
      } finally {
        setLoading(false)
      }
    }
    fetchPaths()
  }, [])

  if (loading) return <LoadingState message="Cargando tu ruta..." />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  if (!activePath) {
    return (
      <EmptyState
        icon={<Map className="h-8 w-8" />}
        title="Sin ruta de aprendizaje"
        description="Define un objetivo para crear tu ruta personalizada"
        action={
          <Button onClick={() => {}}>Crear ruta</Button>
        }
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Mi Ruta</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {activePath.goal}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Progreso general</span>
          <Progress
            value={activePath.progress}
            size="lg"
            showLabel
            className="w-32"
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-neutral-200 hidden md:block" />

        <div className="space-y-6">
          {activePath.stages
            .sort((a, b) => a.order - b.order)
            .map((stage, index) => (
              <StageCard
                key={stage.id}
                stage={stage}
                index={index}
                isLast={index === activePath.stages.length - 1}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

function StageCard({
  stage,
  index,
  isLast,
}: {
  stage: Stage
  index: number
  isLast: boolean
}) {
  const Icon = stageIcons[stage.status]
  const colorClass = stageColors[stage.status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative flex gap-6"
    >
      <div className="hidden md:flex flex-col items-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${colorClass} transition-all duration-300`}
        >
          <Icon className="h-6 w-6" />
        </div>
        {!isLast && (
          <div className="flex-1 w-0.5 bg-neutral-200 min-h-[4rem]" />
        )}
      </div>

      <Card className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={
                  stage.status === 'completed'
                    ? 'success'
                    : stage.status === 'in_progress'
                      ? 'warning'
                      : stage.status === 'available'
                        ? 'primary'
                        : 'default'
                }
              >
                {stage.status === 'locked'
                  ? 'Bloqueado'
                  : stage.status === 'available'
                    ? 'Disponible'
                    : stage.status === 'in_progress'
                      ? 'En progreso'
                      : 'Completado'}
              </Badge>
              <span className="text-xs text-neutral-400">
                Etapa {index + 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {stage.name}
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              {stage.description}
            </p>

            {stage.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {stage.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Progress value={stage.progress} size="sm" showLabel />
            </div>
          </div>
        </div>

        {stage.resources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">
              Recursos
            </p>
            <div className="space-y-2">
              {stage.resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors no-underline"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  {resource.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
