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
  Flame,
  NotebookPen,
  BarChart3,
  CheckCheck,
  BrainCircuit,
  Calendar,
} from 'lucide-react'
import { useAuthStore, usePathStore, useStatsStore } from '@core/store'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { StudyService } from '@features/learning-path/services/StudyService'
import { ReviewService } from '@features/learning-path/services/ReviewService'
import { CATEGORIES } from '@shared/types'
import type { LearningPath, RecentActivity, LearningGoal } from '@shared/types'
import { Card, CardHeader, CardContent } from '@shared/components/ui/Card'
import { Progress } from '@shared/components/ui/Progress'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { AnimatedCounter } from '@shared/components/ui/AnimatedCounter'
import { NewPathModal } from '@features/learning-path/components/NewPathModal'
import { formatDate, cn } from '@shared/lib/utils'

function getWeekDays() {
  const days = []
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { stats, setStats } = useStatsStore()
  const { paths, setPaths, setActivePath } = usePathStore()
  const [loading, setLoading] = useState(true)
  const [showNewPath, setShowNewPath] = useState(false)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [weekMinutes, setWeekMinutes] = useState(0)
  const [goals, setGoals] = useState<LearningGoal[]>([])
  const [dueReviews, setDueReviews] = useState<{ pathId: string; pathTitle: string; topic: import('@shared/types').Topic }[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [weekActivity, setWeekActivity] = useState<{ date: string; active: boolean }[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const loaded = await PathStorageService.getAll()
        if (cancelled) return
        setPaths(loaded)
        const storedStats = await UserStorageService.getStats()
        const allTopics = loaded.flatMap((p) => p.stages.flatMap((s) => s.topics))
        const completed = allTopics.filter((t) => t.completed).length
        const total = allTopics.length
        const globalProgress = total > 0 ? Math.round((completed / total) * 100) : 0
        const synced = await StudyService.syncStats(storedStats)
        if (cancelled) return
        setStats({ ...synced, totalPaths: loaded.length, completedTopics: completed, totalProgress: globalProgress })
        setActivity((await UserStorageService.getActivity()) as RecentActivity[])

        const s = StudyService.getStreak()
        setStreak(s)
        setLongestStreak(StudyService.getLongestStreak())
        setTodayMinutes(StudyService.getTodayMinutes())
        setWeekMinutes(StudyService.getWeekMinutes())

        const updatedGoals = StudyService.updateGoalProgress()
        setGoals(updatedGoals)

        const due = await ReviewService.getDueTopics()
        setDueReviews(due)

        const sessions = StudyService.getSessions()
        const weekDays = getWeekDays()
        setWeekActivity(weekDays.map((d) => ({ date: d, active: sessions.some((s) => s.date === d) })))
      } catch (err) {
        console.error('Dashboard init error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleDailyCheckIn = () => {
    StudyService.checkIn()
    setStreak(StudyService.getStreak())
    setTodayMinutes(StudyService.getTodayMinutes())
    setWeekMinutes(StudyService.getWeekMinutes())
    const sessions = StudyService.getSessions()
    const weekDays = getWeekDays()
    setWeekActivity(weekDays.map((d) => ({ date: d, active: sessions.some((s) => s.date === d) })))
    setLongestStreak(StudyService.getLongestStreak())
  }

  const activePaths = paths.filter((p) => p.progress < 100)
  const completedPaths = paths.filter((p) => p.progress >= 100)

  const categoryInfo = (cat: string) => CATEGORIES.find((c) => c.value === cat)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-4 border-neutral-200 " />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <NewPathModal open={showNewPath} onClose={() => setShowNewPath(false)} />
      <GoalModal open={showGoalModal} onClose={() => { setShowGoalModal(false); setGoals(StudyService.getGoals()) }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 ">
              Hola, {user?.name?.split(' ')[0] || 'Estudiante'}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {streak > 0 ? `Llevas ${streak} dia${streak > 1 ? 's' : ''} seguido` : 'Comienza tu racha de estudio hoy'}
            </p>
          </div>
          <Button onClick={() => setShowNewPath(true)} icon={<Plus className="h-4 w-4" />}>
            Nueva Ruta
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Route className="h-5 w-5" />} label="Rutas" value={<AnimatedCounter to={paths.length} />} />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Completados" value={<AnimatedCounter to={stats.completedTopics} />} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Progreso" value={<AnimatedCounter to={stats.totalProgress} suffix="%" />} />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Racha" value={<AnimatedCounter to={streak} />} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Hoy" value={<><AnimatedCounter to={todayMinutes} /> <span className="text-xs text-neutral-400 font-normal">min</span></>} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="text-sm font-semibold text-neutral-900 ">Racha de estudio</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold transition-colors', streak > 0 ? 'bg-orange-50 text-orange-600' : 'bg-neutral-50 text-neutral-300')}>
                  {streak}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 ">{streak > 0 ? `Dia ${streak}` : 'Sin racha activa'}</p>
                  <p className="text-xs text-neutral-500">Mejor racha: {longestStreak} dias</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {weekActivity.map((d) => (
                  <div key={d.date} className="flex flex-col items-center gap-1 flex-1">
                    <div className={cn('h-8 w-full rounded-md transition-all', d.active ? 'bg-primary-400' : 'bg-neutral-100 ')} />
                    <span className="text-[9px] text-neutral-400 uppercase">{['D', 'L', 'M', 'M', 'J', 'V', 'S'][new Date(d.date).getDay()]}</span>
                  </div>
                ))}
              </div>
              <Button size="sm" fullWidth variant={streak === 0 ? 'primary' : 'secondary'} onClick={handleDailyCheckIn}>
                {streak > 0 ? 'Check-in de hoy' : 'Empezar racha'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <Target className="h-5 w-5 text-primary-600" />
              <h2 className="text-sm font-semibold text-neutral-900 ">Metas semanales</h2>
              <button onClick={() => setShowGoalModal(true)} className="ml-auto text-xs text-primary-600 hover:text-primary-700 font-medium">Editar</button>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-neutral-400 mb-2">Sin metas configuradas</p>
                  <Button size="sm" variant="outline" onClick={() => setShowGoalModal(true)}>
                    Configurar metas
                  </Button>
                </div>
              ) : (
                goals.map((g) => {
                  const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0
                  return (
                    <div key={g.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-neutral-700 ">{g.label}</span>
                        <span className="text-neutral-500">{g.current}/{g.target}</span>
                      </div>
                      <Progress value={pct} size="sm" />
                    </div>
                  )
                })
              )}
              <p className="text-xs text-neutral-400">{weekMinutes} min estudiados esta semana</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <BrainCircuit className="h-5 w-5 text-violet-500" />
              <h2 className="text-sm font-semibold text-neutral-900 ">Repaso pendiente</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {dueReviews.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCheck className="h-8 w-8 mx-auto text-green-400 mb-2" />
                  <p className="text-sm text-neutral-500">Todo al dia</p>
                  <p className="text-xs text-neutral-400 mt-1">No hay topics pendientes de repasar</p>
                </div>
              ) : (
                dueReviews.slice(0, 4).map((r) => (
                  <Link key={r.topic.id} to="/learning-path" className="flex items-center gap-3 no-underline group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-500 group-hover:bg-violet-100 transition-colors">
                      <NotebookPen className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-600 transition-colors truncate">{r.topic.name}</p>
                      <p className="text-xs text-neutral-400 truncate">{r.pathTitle}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                  </Link>
                ))
              )}
              {dueReviews.length > 4 && (
                <Link to="/learning-path" className="block text-xs text-primary-600 hover:text-primary-700 font-medium text-center pt-1">
                  Ver {dueReviews.length - 4} mas
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
          {activePaths.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 ">Rutas activas</h2>
                <Link to="/learning-path" className="text-sm text-primary-600 hover:text-primary-700 font-medium no-underline">Ver todas</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePaths.slice(0, 6).map((path) => {
                  const cat = categoryInfo(path.category)
                  return (
                    <Link key={path.id} to="/learning-path" onClick={() => setActivePath(path)} className="no-underline">
                      <Card hover>
                        <CardHeader>
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-sm font-semibold text-primary-600 ">
                            {cat?.label.charAt(0) || '?'}
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
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activity.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <Activity className="h-5 w-5 text-primary-600 " />
                    <h2 className="text-sm font-semibold text-neutral-900 ">Actividad reciente</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activity.slice(0, 5).map((act) => (
                        <div key={act.id} className="flex items-start gap-3 text-sm">
                          <span className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-primary-600 ">
                            {act.type === 'path_created' ? 'NUEVO' : act.type === 'topic_completed' ? 'HECHO' : 'FIN'}
                          </span>
                          <div>
                            <p className="text-neutral-700 ">{act.title}</p>
                            <p className="text-xs text-neutral-400">{formatDate(act.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="h-full">
                <CardHeader>
                  <BarChart3 className="h-5 w-5 text-primary-600 " />
                  <h2 className="text-sm font-semibold text-neutral-900 ">Esta semana</h2>
                  <span className="ml-auto text-xs text-neutral-400">{weekMinutes} min</span>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-28">
                    {weekActivity.map((d) => {
                      const sessions = StudyService.getSessions().filter((s) => s.date === d.date)
                      const maxMin = Math.max(1, ...weekActivity.map((wd) => StudyService.getSessions().filter((s) => s.date === wd.date).reduce((sum, s) => sum + s.duration, 0)))
                      const dayMin = sessions.reduce((sum, s) => sum + s.duration, 0)
                      const height = maxMin > 0 ? Math.max(4, (dayMin / maxMin) * 100) : 4
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[9px] text-neutral-400">{dayMin > 0 ? `${dayMin}m` : ''}</span>
                          <div className="w-full rounded-md bg-primary-100 transition-all duration-300" style={{ height: `${height}%` }}>
                            <div
                              className="w-full rounded-md bg-primary-500 transition-all duration-500"
                              style={{ height: d.active ? '100%' : '0%' }}
                            />
                          </div>
                          <span className="text-[9px] text-neutral-400 uppercase">{['D', 'L', 'M', 'M', 'J', 'V', 'S'][new Date(d.date).getDay()]}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {completedPaths.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Rutas completadas</h2>
              <div className="flex flex-wrap gap-3">
                {completedPaths.map((p) => (
                  <Badge key={p.id} variant="success" size="md">
                    {p.title} — 100%
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Link to="/ai-assistant" className="block no-underline">
              <div className="rounded-xl border border-primary-200 bg-primary-50 p-5 hover:bg-primary-100 transition-colors /50">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white ">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-primary-900 ">Asistente IA</h3>
                    <p className="text-sm text-primary-700 mt-1">Pregunta que aprender despues, como vas o que recursos usar</p>
                    <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary-600 ">
                      Consultar ahora <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 ">{icon}</div>
        <div>
          <p className="text-xs text-neutral-500 ">{label}</p>
          <p className="text-lg font-semibold text-neutral-900 ">{value}</p>
        </div>
      </div>
    </Card>
  )
}

function GoalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [topicsTarget, setTopicsTarget] = useState('5')
  const [sessionsTarget, setSessionsTarget] = useState('3')

  if (!open) return null

  const handleSave = () => {
    const weekStart = StudyService.getWeekStart()
    const goals: LearningGoal[] = [
      { id: 'goal_1', type: 'weekly_topics', target: parseInt(topicsTarget) || 5, current: 0, weekStart, label: 'Temas por semana' },
      { id: 'goal_2', type: 'weekly_sessions', target: parseInt(sessionsTarget) || 3, current: 0, weekStart, label: 'Sesiones por semana' },
    ]
    StudyService.setGoals(goals)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Metas semanales</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Temas a completar por semana</label>
            <input type="number" min="1" max="50" value={topicsTarget} onChange={(e) => setTopicsTarget(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Sesiones de estudio por semana</label>
            <input type="number" min="1" max="30" value={sessionsTarget} onChange={(e) => setSessionsTarget(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar metas</Button>
        </div>
      </motion.div>
    </div>
  )
}
