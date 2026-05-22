import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  BookOpen,
  Zap,
  Target,
  Clock,
  Plus,
  ArrowRight,
  Bot,
  Route,
  Activity,
} from 'lucide-react'
import { useAuthStore, usePathStore, useStatsStore } from '@core/store'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { CATEGORIES } from '@shared/types'
import type { LearningPath, RecentActivity } from '@shared/types'
import { Card, CardHeader, CardContent } from '@shared/components/ui/Card'
import { Progress } from '@shared/components/ui/Progress'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { NewPathModal } from '@features/learning-path/components/NewPathModal'
import { formatDate } from '@shared/lib/utils'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { stats, setStats } = useStatsStore()
  const { paths, setPaths, setActivePath } = usePathStore()
  const [loading, setLoading] = useState(true)
  const [showNewPath, setShowNewPath] = useState(false)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const loaded = PathStorageService.getAll()
    setPaths(loaded)
    setStats(UserStorageService.getStats())
    setActivity(UserStorageService.getActivity() as RecentActivity[])
    setLoading(false)
  }, [])

  const activePaths = paths.filter((p) => p.progress < 100)
  const completedPaths = paths.filter((p) => p.progress >= 100)

  const categoryInfo = (cat: string) => CATEGORIES.find((c) => c.value === cat)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <NewPathModal open={showNewPath} onClose={() => setShowNewPath(false)} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Hola, {user?.name?.split(' ')[0] || 'Estudiante'}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {activePaths.length > 0
                ? `Tienes ${activePaths.length} ruta${activePaths.length > 1 ? 's' : ''} activa${activePaths.length > 1 ? 's' : ''}`
                : 'Comienza tu viaje de aprendizaje'}
            </p>
          </div>
          <Button onClick={() => setShowNewPath(true)} icon={<Plus className="h-4 w-4" />}>
            Nueva Ruta
          </Button>
        </div>
      </motion.div>

      {paths.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <EmptyState
            icon={<Route className="h-10 w-10" />}
            title="No tienes rutas de aprendizaje"
            description="Crea tu primera ruta y comienza a aprender cualquier tema"
            action={<Button size="lg" onClick={() => setShowNewPath(true)}>Crear mi primera ruta</Button>}
          />
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard icon={<Route className="h-5 w-5" />} label="Rutas creadas" value={paths.length.toString()} />
            <StatCard icon={<Zap className="h-5 w-5" />} label="Temas completados" value={stats.completedTopics.toString()} />
            <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Progreso global" value={`${stats.totalProgress}%`} />
            <StatCard icon={<Clock className="h-5 w-5" />} label="Días activo" value={stats.activeDays.toString()} />
          </motion.div>

          {activePaths.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Rutas activas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePaths.slice(0, 6).map((path) => {
                  const cat = categoryInfo(path.category)
                  return (
                    <Link key={path.id} to="/learning-path" onClick={() => setActivePath(path)} className="no-underline">
                      <Card hover>
                        <CardHeader>
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-lg">
                            {cat?.emoji || '📚'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-neutral-900 truncate">{path.title}</h3>
                            <p className="text-xs text-neutral-400 truncate">{cat?.label || path.category}</p>
                          </div>
                          <Badge variant={path.difficulty === 'beginner' ? 'default' : path.difficulty === 'intermediate' ? 'warning' : 'primary'}>
                            {path.difficulty === 'beginner' ? 'Principiante' : path.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <Progress value={path.progress} size="sm" showLabel />
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
              {activePaths.length > 6 && (
                <Link to="/learning-path" className="mt-4 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium no-underline transition-colors">
                  Ver todas las rutas <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activity.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <Activity className="h-5 w-5 text-primary-600" />
                    <h2 className="text-sm font-semibold text-neutral-900">Actividad reciente</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activity.slice(0, 5).map((act) => (
                        <div key={act.id} className="flex items-start gap-3 text-sm">
                          <span className="mt-0.5">
                            {act.type === 'path_created' ? '🆕' : act.type === 'topic_completed' ? '✅' : '🎉'}
                          </span>
                          <div>
                            <p className="text-neutral-700">{act.title}</p>
                            <p className="text-xs text-neutral-400">{formatDate(act.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Link to="/ai-assistant" className="block no-underline">
                <div className="rounded-xl border border-primary-200 bg-primary-50 p-5 hover:bg-primary-100 transition-colors h-full">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-primary-900">Asistente IA</h3>
                      <p className="text-sm text-primary-700 mt-1">Pregunta qué aprender después, cómo vas o qué recursos usar</p>
                      <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary-600">
                        Consultar ahora <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {completedPaths.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Rutas completadas 🎉</h2>
              <div className="flex flex-wrap gap-3">
                {completedPaths.map((p) => (
                  <Badge key={p.id} variant="success" size="md">
                    {p.title} — 100%
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">{icon}</div>
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="text-lg font-semibold text-neutral-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}
