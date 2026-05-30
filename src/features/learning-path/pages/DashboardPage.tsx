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
  Sparkles,
  FileText,
  Library,
  Award,
  Timer,
  ChevronRight,
  Star,
} from 'lucide-react'
import { useAuthStore, usePathStore, useStatsStore } from '@core/store'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { StudyService } from '@features/learning-path/services/StudyService'
import { StudyTimer } from '@shared/components/ui/StudyTimer'
import { ReviewService } from '@features/learning-path/services/ReviewService'
import { AchievementService } from '@features/profile/services/AchievementService'
import { CATEGORIES } from '@shared/types'
import type { LearningPath, RecentActivity, LearningGoal, Achievement } from '@shared/types'
import { Card, CardHeader, CardContent } from '@shared/components/ui/Card'
import { Progress } from '@shared/components/ui/Progress'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { AnimatedCounter } from '@shared/components/ui/AnimatedCounter'
import { NewPathModal } from '@features/learning-path/components/NewPathModal'
import { QuickNotes } from '@features/profile/components/QuickNotes'
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

function getWeekStart() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 26 },
  },
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
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [goals, setGoals] = useState<LearningGoal[]>([])
  const [dueReviews, setDueReviews] = useState<{ pathId: string; pathTitle: string; topic: import('@shared/types').Topic }[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [weekActivity, setWeekActivity] = useState<{ date: string; active: boolean }[]>([])
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
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
        setTotalMinutes(StudyService.getTotalMinutes())

        const updatedGoals = StudyService.updateGoalProgress()
        setGoals(updatedGoals)

        const due = await ReviewService.getDueTopics()
        setDueReviews(due)

        const sessions = StudyService.getSessions()
        const weekDays = getWeekDays()
        setWeekActivity(weekDays.map((d) => ({ date: d, active: sessions.some((s) => s.date === d) })))

        const newlyUnlocked = await AchievementService.checkAndUnlock()
        if (newlyUnlocked.length > 0) {
          setRecentAchievements(newlyUnlocked)
        }
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
    setTotalMinutes(StudyService.getTotalMinutes())
    const sessions = StudyService.getSessions()
    const weekDays = getWeekDays()
    setWeekActivity(weekDays.map((d) => ({ date: d, active: sessions.some((s) => s.date === d) })))
    setLongestStreak(StudyService.getLongestStreak())
  }

  const activePaths = paths.filter((p) => p.progress < 100)
  const completedPaths = paths.filter((p) => p.progress >= 100)

  const categoryInfo = (cat: string) => CATEGORIES.find((c) => c.value === cat)

  const allTopicsData = paths.flatMap((p) => p.stages.flatMap((s) => s.topics))
  const completedTopicsCount = allTopicsData.filter((t) => t.completed).length

  const sessions = StudyService.getSessions()
  const sessionsThisWeek = sessions.filter((s) => s.date >= getWeekStart().split('T')[0])
  const sessionsToday = sessions.filter((s) => s.date === new Date().toISOString().split('T')[0])
  const avgDailyMin = sessionsThisWeek.length > 0 ? Math.round(weekMinutes / Math.max(1, sessionsThisWeek.length)) : 0
  const bestDay = (() => {
    const dayMap: Record<string, number> = {}
    sessionsThisWeek.forEach((s) => {
      const dayName = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][new Date(s.date).getDay()]
      dayMap[dayName] = (dayMap[dayName] || 0) + s.duration
    })
    const best = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]
    return best ? { day: best[0], min: best[1] } : null
  })()

  const nextMilestone = (() => {
    const thresholds = [
      { topics: 5, label: 'Explorador', icon: Star },
      { topics: 15, label: 'Aprendiz', icon: BookOpen },
      { topics: 30, label: 'Estudiante', icon: BrainCircuit },
      { topics: 50, label: 'Conocedor', icon: Award },
      { topics: 75, label: 'Experto', icon: TrendingUp },
      { topics: 100, label: 'Master', icon: Zap },
    ]
    const next = thresholds.find((t) => completedTopicsCount < t.topics)
    if (!next) return null
    const remaining = next.topics - completedTopicsCount
    return { ...next, remaining }
  })()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-4 border-neutral-200" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <NewPathModal open={showNewPath} onClose={() => setShowNewPath(false)} />
      <GoalModal open={showGoalModal} onClose={() => { setShowGoalModal(false); setGoals(StudyService.getGoals()) }} />

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary-700 via-primary-600 to-gold bg-clip-text text-transparent truncate">
                Hola, {user?.name?.split(' ')[0] || 'Estudiante'}
              </h1>
              {nextMilestone && completedTopicsCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/5 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-gold-dark">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">A </span>{nextMilestone.remaining}<span className="hidden sm:inline"> de {nextMilestone.label}</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 sm:mt-1.5 ml-0.5">
              {streak > 0
                ? `Llevas ${streak} dia${streak > 1 ? 's' : ''} seguido estudiando`
                : 'Comienza tu racha de estudio hoy'}
              {longestStreak > 0 && streak > 0 && (
                <span className="text-neutral-400"> | Mejor: {longestStreak} dias</span>
              )}
            </p>
          </div>
          <Button onClick={() => setShowNewPath(true)} icon={<Plus className="h-4 w-4" />} className="flex-shrink-0">
            <span className="hidden sm:inline">Nueva </span>Ruta
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <StatCard icon={<Route className="h-5 w-5" />} label="Rutas" value={<AnimatedCounter to={paths.length} />} color="primary" />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Completados" value={<AnimatedCounter to={stats.completedTopics} />} color="primary" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Progreso" value={<AnimatedCounter to={stats.totalProgress} suffix="%" />} color="primary" />
        <StatCard icon={<Flame className="h-5 w-5" />} label="Racha" value={<AnimatedCounter to={streak} />} color="gold" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Hoy" value={<><AnimatedCounter to={todayMinutes} /> <span className="text-xs text-neutral-400 font-normal">min</span></>} color="primary" />
        <StatCard icon={<Timer className="h-5 w-5" />} label="Total" value={<><AnimatedCounter to={totalMinutes} /> <span className="text-xs text-neutral-400 font-normal">min</span></>} color="primary" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction
          icon={<Route className="h-5 w-5" />}
          label="Mis rutas"
          onClick={() => navigate('/learning-path')}
          color="primary"
        />
        <QuickAction
          icon={<Bot className="h-5 w-5" />}
          label="Asistente IA"
          onClick={() => navigate('/ai-assistant')}
          color="gold"
        />
        <QuickAction
          icon={<Library className="h-5 w-5" />}
          label="Recursos"
          onClick={() => navigate('/resources')}
          color="primary"
        />
        <QuickAction
          icon={<Calendar className="h-5 w-5" />}
          label="Check-in diario"
          onClick={handleDailyCheckIn}
          color={streak > 0 ? 'gold' : 'primary'}
        />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <Timer className="h-5 w-5 text-gold" />
              <h2 className="text-sm font-semibold text-neutral-900">Temporizador</h2>
            </CardHeader>
            <CardContent>
              <StudyTimer onSessionComplete={() => { setTodayMinutes(StudyService.getTodayMinutes()); setTotalMinutes(StudyService.getTotalMinutes()) }} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <Flame className={cn('h-5 w-5', streak > 0 ? 'text-gold' : 'text-neutral-300')} />
              <h2 className="text-sm font-semibold text-neutral-900">Racha de estudio</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold transition-all duration-300', streak > 0 ? 'bg-gradient-to-br from-gold/20 to-gold/5 text-gold-dark shadow-xs' : 'bg-neutral-50 text-neutral-300')}>
                  {streak}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{streak > 0 ? `Dia ${streak}` : 'Sin racha activa'}</p>
                  <p className="text-xs text-neutral-500">Mejor racha: {longestStreak} dias</p>
                  {todayMinutes > 0 && (
                    <p className="text-xs text-gold-dark mt-0.5 font-medium">{todayMinutes} min hoy</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5">
                {weekActivity.map((d) => (
                  <div key={d.date} className="flex flex-col items-center gap-1 flex-1">
                    <div className={cn('h-8 w-full rounded-md transition-all duration-300', d.active ? 'bg-gradient-to-b from-gold to-gold/60 shadow-xs' : 'bg-neutral-100')} />
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

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <Target className="h-5 w-5 text-gold" />
              <h2 className="text-sm font-semibold text-neutral-900">Metas semanales</h2>
              <button onClick={() => setShowGoalModal(true)} className="ml-auto text-xs text-gold hover:text-gold-dark font-medium transition-colors">Editar</button>
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
                        <span className="text-neutral-700">{g.label}</span>
                        <span className="text-neutral-500">{g.current}/{g.target}</span>
                      </div>
                      <Progress value={pct} size="sm" />
                    </div>
                  )
                })
              )}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-neutral-400">{weekMinutes} min estudiados esta semana</p>
                {weekMinutes > 0 && (
                  <span className="text-xs text-gold-dark font-medium">{avgDailyMin} min/sesion</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <BrainCircuit className="h-5 w-5 text-gold" />
              <h2 className="text-sm font-semibold text-neutral-900">Repaso pendiente</h2>
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold-dark group-hover:bg-gold/20 transition-colors">
                      <NotebookPen className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-600 transition-colors truncate">{r.topic.name}</p>
                      <p className="text-xs text-neutral-400 truncate">{r.pathTitle}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-gold transition-colors flex-shrink-0" />
                  </Link>
                ))
              )}
              {dueReviews.length > 4 && (
                <Link to="/learning-path" className="block text-xs text-gold hover:text-gold-dark font-medium text-center pt-1 transition-colors">
                  Ver {dueReviews.length - 4} mas
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={itemVariants}>
          <QuickNotes />
        </motion.div>

        {recentAchievements.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <Award className="h-5 w-5 text-gold" />
                <h2 className="text-sm font-semibold text-neutral-900">Logros desbloqueados</h2>
                <Link to="/profile" className="ml-auto text-xs text-gold hover:text-gold-dark font-medium transition-colors">
                  Ver todos
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAchievements.slice(0, 3).map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gold/5 to-transparent border border-gold/20"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 text-2xl flex-shrink-0">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-neutral-900">{achievement.title}</h3>
                      <p className="text-xs text-neutral-500">{achievement.description}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {nextMilestone && (
        <motion.div variants={itemVariants}>
          <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/5 to-gold/[0.02] p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3 sm:gap-4 flex-wrap">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-white shadow-xs flex-shrink-0">
                <nextMilestone.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Proximo hito: {nextMilestone.label}</h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">Completa {nextMilestone.remaining} tema{nextMilestone.remaining > 1 ? 's' : ''} mas para alcanzar el nivel {nextMilestone.label}</p>
                <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 max-w-xs">
                    <div className="h-1.5 sm:h-2 rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.round((completedTopicsCount / nextMilestone.topics) * 100))}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-medium">{completedTopicsCount}/{nextMilestone.topics}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span className="text-xl sm:text-2xl font-bold text-gold-dark">{nextMilestone.remaining}</span>
                <span className="text-[10px] sm:text-xs text-neutral-400">restan</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {paths.length === 0 ? (
        <motion.div variants={itemVariants}>
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
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Rutas activas</h2>
                <Link to="/learning-path" className="text-sm text-gold hover:text-gold-dark font-medium no-underline transition-colors">Ver todas</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {activePaths.slice(0, 6).map((path) => {
                  const cat = categoryInfo(path.category)
                  return (
                    <Link key={path.id} to="/learning-path" onClick={() => setActivePath(path)} className="no-underline">
                      <Card hover>
                        <CardHeader>
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-sm font-semibold text-primary-600">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {activity.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <Activity className="h-5 w-5 text-primary-600" />
                    <h2 className="text-sm font-semibold text-neutral-900">Actividad reciente</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activity.slice(0, 5).map((act) => (
                        <div key={act.id} className="flex items-start gap-3 text-sm">
                          <span className={cn(
                            'mt-0.5 text-xs font-semibold uppercase tracking-wider',
                            act.type === 'path_created' ? 'text-gold' : act.type === 'topic_completed' ? 'text-primary-600' : 'text-neutral-500'
                          )}>
                            {act.type === 'path_created' ? 'NUEVO' : act.type === 'topic_completed' ? 'HECHO' : 'FIN'}
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

            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <BarChart3 className="h-5 w-5 text-gold" />
                  <h2 className="text-sm font-semibold text-neutral-900">Esta semana</h2>
                  <span className="ml-auto text-xs text-neutral-400">{weekMinutes} min</span>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-28">
                    {weekActivity.map((d) => {
                      const daySessions = sessions.filter((s) => s.date === d.date)
                      const maxMin = Math.max(1, ...weekActivity.map((wd) => sessions.filter((s) => s.date === wd.date).reduce((sum, s) => sum + s.duration, 0)))
                      const dayMin = daySessions.reduce((sum, s) => sum + s.duration, 0)
                      const height = maxMin > 0 ? Math.max(4, (dayMin / maxMin) * 100) : 4
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[9px] text-neutral-400">{dayMin > 0 ? `${dayMin}m` : ''}</span>
                          <div className="w-full rounded-md bg-neutral-100 transition-all duration-300" style={{ height: `${height}%` }}>
                            <div
                              className="w-full rounded-md bg-gradient-to-t from-gold to-gold-light transition-all duration-500"
                              style={{ height: d.active ? '100%' : '0%' }}
                            />
                          </div>
                          <span className="text-[9px] text-neutral-400 uppercase">{['D', 'L', 'M', 'M', 'J', 'V', 'S'][new Date(d.date).getDay()]}</span>
                        </div>
                      )
                    })}
                  </div>
                  {bestDay && (
                    <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-500 border-t border-neutral-100 pt-2 sm:pt-3 flex-wrap">
                      <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold flex-shrink-0" />
                      <span>Mejor dia: <strong className="text-neutral-700">{bestDay.day}</strong> ({bestDay.min} min)</span>
                      <span className="text-neutral-300 mx-0.5 sm:mx-1">|</span>
                      <span>Promedio: <strong className="text-neutral-700">{avgDailyMin} min</strong>/sesion</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {completedPaths.length > 0 && (
            <motion.div variants={itemVariants}>
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

          <motion.div variants={itemVariants}>
            <Link to="/ai-assistant" className="block no-underline group">
              <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/5 via-white to-gold/5 p-4 sm:p-5 hover:from-gold/10 hover:via-white hover:to-gold/10 transition-all duration-300 shadow-xs">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-white shadow-xs transition-transform group-hover:scale-105 duration-200 flex-shrink-0">
                    <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Asistente IA</h3>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1">Pregunta que aprender despues, como vas o que recursos usar</p>
                    <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gold-dark group-hover:text-gold-dark transition-colors">
                      Consultar ahora <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5 duration-200" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: 'primary' | 'gold' }) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { type: 'spring' as const, stiffness: 400, damping: 20 } }}
      className="rounded-xl border border-neutral-200/80 bg-white p-3 sm:p-4 transition-shadow duration-200 hover:shadow-md overflow-hidden"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className={cn(
          'flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg transition-colors flex-shrink-0',
          color === 'gold' ? 'bg-gold/10 text-gold-dark' : 'bg-primary-50 text-primary-600'
        )}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-neutral-500 truncate">{label}</p>
          <p className="text-base sm:text-lg font-semibold text-neutral-900 truncate">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

function QuickAction({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: 'primary' | 'gold' }) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 sm:gap-3 rounded-xl border p-3 sm:p-3.5 text-sm font-medium transition-all duration-200 cursor-pointer w-full',
        color === 'gold'
          ? 'border-gold/30 bg-gold/5 text-gold-dark hover:bg-gold/10 hover:border-gold/50 shadow-xs'
          : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/50 shadow-xs'
      )}
    >
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors flex-shrink-0',
        color === 'gold' ? 'bg-gold/10 text-gold-dark' : 'bg-primary-50 text-primary-600'
      )}>
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </motion.button>
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 350, damping: 25 }}
        className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold-dark">
            <Target className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">Metas semanales</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Temas a completar por semana</label>
            <input type="number" min="1" max="50" value={topicsTarget} onChange={(e) => setTopicsTarget(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Sesiones de estudio por semana</label>
            <input type="number" min="1" max="30" value={sessionsTarget} onChange={(e) => setSessionsTarget(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 transition-all" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button className="bg-gold hover:bg-gold-dark border-gold text-white" onClick={handleSave}>Guardar metas</Button>
        </div>
      </motion.div>
    </div>
  )
}
