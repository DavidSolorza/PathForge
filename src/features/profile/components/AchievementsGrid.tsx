import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Lock } from 'lucide-react'
import { AchievementService } from '@features/profile/services/AchievementService'
import type { Achievement } from '@shared/types'
import { Card } from '@shared/components/ui/Card'
import { Progress } from '@shared/components/ui/Progress'
import { cn } from '@shared/lib/utils'

export function AchievementsGrid() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlocked, setUnlocked] = useState<Achievement[]>([])
  const [filter, setFilter] = useState<'all' | 'learning' | 'streak' | 'milestone'>('all')

  useEffect(() => {
    setAchievements(AchievementService.getAll())
    setUnlocked(AchievementService.getUnlocked())
  }, [])

  const filteredAchievements = filter === 'all'
    ? achievements
    : achievements.filter(a => a.category === filter)

  const unlockedCount = unlocked.length
  const totalCount = achievements.length
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  const categoryLabels = {
    all: 'Todos',
    learning: 'Aprendizaje',
    streak: 'Rachas',
    milestone: 'Hitos'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-white">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Logros</h2>
            <p className="text-xs text-neutral-500">{unlockedCount} de {totalCount} desbloqueados ({percentage}%)</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'learning', 'streak', 'milestone'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              filter === cat
                ? 'bg-gold text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = unlocked.some(a => a.id === achievement.id)
          const progress = AchievementService.getProgress(achievement)

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={cn(
                  'relative overflow-hidden transition-all',
                  isUnlocked
                    ? 'border-gold/30 bg-gradient-to-br from-gold/5 to-transparent'
                    : 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold flex-shrink-0',
                    isUnlocked
                      ? 'bg-gradient-to-br from-gold/20 to-gold/5 text-gold-dark'
                      : 'bg-neutral-100 text-neutral-400'
                  )}>
                    {isUnlocked ? achievement.icon : <Lock className="h-5 w-5 text-neutral-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      'text-sm font-semibold truncate',
                      isUnlocked ? 'text-neutral-900' : 'text-neutral-500'
                    )}>
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                      {achievement.description}
                    </p>
                    {!isUnlocked && (
                      <div className="mt-2">
                        <Progress value={progress.percentage} size="sm" />
                        <p className="text-[10px] text-neutral-400 mt-1">
                          {progress.current} / {progress.target}
                        </p>
                      </div>
                    )}
                    {isUnlocked && achievement.unlockedAt && (
                      <p className="text-[10px] text-gold-dark mt-1 font-medium">
                        Desbloqueado {new Date(achievement.unlockedAt).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
