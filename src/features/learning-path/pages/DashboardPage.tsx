import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Zap,
  Map,
  ArrowRight,
  Bot,
} from 'lucide-react'
import { useAuthStore, useUserStore, usePathStore, useRecommendationStore } from '@core/store'
import { UserService } from '@features/profile/services'
import { LearningPathService } from '@features/learning-path/services'
import { RecommendationService } from '@features/recommendations/services'
import { Card, CardHeader, CardContent } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Progress } from '@shared/components/ui/Progress'
import { LoadingState } from '@shared/components/ui/LoadingState'
import { ErrorState } from '@shared/components/ui/ErrorState'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { skills, stats, setSkills, setStats } = useUserStore()
  const { paths, setPaths, setActivePath } = usePathStore()
  const { recommendations, setRecommendations } = useRecommendationStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [skillsData, statsData, pathsData, recsData] = await Promise.all([
          UserService.getSkills(),
          UserService.getStats(),
          LearningPathService.getAll(),
          RecommendationService.getAll(),
        ])
        setSkills(skillsData)
        setStats(statsData)
        setPaths(pathsData)
        if (pathsData.length > 0) {
          setActivePath(pathsData[0])
        }
        setRecommendations(recsData)
      } catch {
        setError('Error al cargar el dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingState message="Preparando tu dashboard..." />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-neutral-900">
          Hola, {user?.name?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Aquí está el resumen de tu progreso
        </p>
      </motion.div>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Progreso total"
            value={`${Math.round(stats.totalProgress)}%`}
          />
          <StatCard
            icon={<Award className="h-5 w-5" />}
            label="Habilidades"
            value={stats.totalSkills.toString()}
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Proyectos"
            value={stats.completedProjects.toString()}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Horas"
            value={stats.hoursLearned.toString()}
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-2 space-y-6"
        >
          {paths.length > 0 && (
            <Card>
              <CardHeader>
                <Map className="h-5 w-5 text-primary-600" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Mi ruta activa
                  </h2>
                </div>
                <Link
                  to="/learning-path"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium no-underline transition-colors"
                >
                  Ver ruta
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-700 font-medium mb-3">
                  {paths[0].goal}
                </p>
                <Progress value={paths[0].progress} size="md" showLabel />
              </CardContent>
            </Card>
          )}

          {skills.length > 0 && (
            <Card>
              <CardHeader>
                <Zap className="h-5 w-5 text-primary-600" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Últimas habilidades
                  </h2>
                </div>
                <Link
                  to="/skills"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium no-underline transition-colors"
                >
                  Ver todas
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skills.slice(0, 3).map((skill) => (
                    <div key={skill.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-700 capitalize">
                            {skill.name}
                          </span>
                          <Badge
                            variant={
                              skill.level === 'expert'
                                ? 'success'
                                : skill.level === 'advanced'
                                  ? 'primary'
                                  : 'warning'
                            }
                          >
                            {skill.level}
                          </Badge>
                        </div>
                        <Progress value={skill.progress} size="sm" className="mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <Bot className="h-5 w-5 text-primary-600" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-neutral-900">
                    Recomendaciones
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.slice(0, 4).map((rec) => (
                    <div key={rec.id}>
                      <p className="text-sm font-medium text-neutral-900">
                        {rec.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {rec.reason}
                      </p>
                    </div>
                  ))}
                </div>
                {recommendations.length > 4 && (
                  <Link
                    to="/ai-assistant"
                    className="mt-4 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium no-underline transition-colors"
                  >
                    Ver más recomendaciones
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          <Link to="/ai-assistant" className="block no-underline">
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 hover:bg-primary-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-900">
                    Consulta a la IA
                  </p>
                  <p className="text-xs text-primary-700 mt-0.5">
                    ¿Qué deberías aprender después?
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          {icon}
        </div>
        <div>
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="text-lg font-semibold text-neutral-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}
