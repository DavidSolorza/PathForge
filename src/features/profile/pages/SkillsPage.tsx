import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Route, Zap, Target } from 'lucide-react'
import { usePathStore, useStatsStore } from '@core/store'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { CATEGORIES } from '@shared/types'
import { Card, CardHeader, CardContent } from '@shared/components/ui/Card'
import { Progress } from '@shared/components/ui/Progress'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'
import { NewPathModal } from '@features/learning-path/components/NewPathModal'

export function SkillsPage() {
  const { paths, setPaths } = usePathStore()
  const { stats, setStats } = useStatsStore()
  const [showNewPath, setShowNewPath] = useState(false)

  useEffect(() => {
    setPaths(PathStorageService.getAll())
    setStats(UserStorageService.getStats())
  }, [])

  const categoryCount: Record<string, number> = {}
  paths.forEach((p) => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1
  })

  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])

  if (paths.length === 0) {
    return (
      <>
        <NewPathModal open={showNewPath} onClose={() => setShowNewPath(false)} />
        <EmptyState
          icon={<Zap className="h-10 w-10" />}
          title="Sin actividad todavía"
          description="Crea rutas de aprendizaje para ver tus estadísticas aquí"
          action={<Button onClick={() => setShowNewPath(true)}>Crear primera ruta</Button>}
        />
      </>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Estadísticas</h1>
        <p className="text-sm text-neutral-500 mt-1">{paths.length} rutas creadas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <Route className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-semibold text-neutral-900">Rutas</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-neutral-900">{paths.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Target className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-semibold text-neutral-900">Progreso promedio</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-neutral-900">{stats.totalProgress}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Zap className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-semibold text-neutral-900">Temas completados</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-neutral-900">{stats.completedTopics}</p>
          </CardContent>
        </Card>
      </div>

      {sortedCategories.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Categorías</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCategories.map(([cat, count]) => {
              const info = CATEGORIES.find((c) => c.value === cat)
              return (
                <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader>
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-xs font-semibold text-primary-600">{info?.label.charAt(0) || '?'}</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-neutral-900">{info?.label || cat}</h3>
                        <p className="text-xs text-neutral-400">{count} ruta{count > 1 ? 's' : ''}</p>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Todas las rutas</h2>
        <div className="space-y-3">
          {paths.map((p) => {
            const cat = CATEGORIES.find((c) => c.value === p.category)
            const total = p.stages.flatMap((s) => s.topics).length
            const done = p.stages.flatMap((s) => s.topics).filter((t) => t.completed).length
            return (
              <Card key={p.id}>
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-xs font-semibold text-primary-600">{cat?.label.charAt(0) || '?'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{p.title}</p>
                    <p className="text-xs text-neutral-400">{done}/{total} temas • {p.progress}%</p>
                  </div>
                  <Progress value={p.progress} size="sm" showLabel className="w-32" />
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
