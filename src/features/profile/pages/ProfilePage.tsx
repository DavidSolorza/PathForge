import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Calendar,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { useAuthStore, useUserStore } from '@core/store'
import { UserService } from '../services'
import { Card, CardHeader, CardContent } from '@shared/components/ui/Card'
import { Avatar } from '@shared/components/ui/Avatar'
import { Badge } from '@shared/components/ui/Badge'
import { Progress } from '@shared/components/ui/Progress'
import { LoadingState } from '@shared/components/ui/LoadingState'
import { ErrorState } from '@shared/components/ui/ErrorState'
import { formatDate } from '@shared/lib/utils'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { skills, stats, loading, setSkills, setStats, setLoading } =
    useUserStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [skillsData, statsData] = await Promise.all([
          UserService.getSkills(),
          UserService.getStats(),
        ])
        setSkills(skillsData)
        setStats(statsData)
      } catch {
        setError('Error al cargar perfil')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingState message="Cargando perfil..." />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const totalProgress = stats?.totalProgress ?? 0

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar size="xl" src={user?.avatar} />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-neutral-900">
                {user?.name || 'Usuario'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </span>
                {user?.createdAt && (
                  <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Calendar className="h-4 w-4" />
                    Miembro desde {formatDate(user.createdAt)}
                  </span>
                )}
              </div>
              {user?.bio && (
                <p className="mt-4 text-sm text-neutral-600">{user.bio}</p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Progreso general"
            value={`${Math.round(stats.totalProgress)}%`}
            delay={0}
          />
          <StatCard
            icon={<Award className="h-5 w-5" />}
            label="Habilidades"
            value={stats.totalSkills.toString()}
            delay={0.1}
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Proyectos"
            value={stats.completedProjects.toString()}
            delay={0.2}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Horas aprendidas"
            value={stats.hoursLearned.toString()}
            delay={0.3}
          />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Progreso general
        </h2>
        <Progress value={totalProgress} size="lg" showLabel />
      </div>

      {skills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Habilidades
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-neutral-900 capitalize">
                        {skill.name}
                      </h3>
                    </div>
                    <Badge
                      variant={
                        skill.level === 'expert'
                          ? 'success'
                          : skill.level === 'advanced'
                            ? 'primary'
                            : skill.level === 'intermediate'
                              ? 'warning'
                              : 'default'
                      }
                    >
                      {skill.level}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <Progress value={skill.progress} size="sm" showLabel />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  delay,
}: {
  icon: ReactNode
  label: string
  value: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            {icon}
          </div>
          <div>
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="text-xl font-semibold text-neutral-900">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
