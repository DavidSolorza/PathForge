import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon } from 'lucide-react'
import { StudyService } from '@features/learning-path/services/StudyService'
import { Card } from '@shared/components/ui/Card'
import { cn } from '@shared/lib/utils'

export function ActivityCalendar() {
  const sessions = StudyService.getSessions()

  const calendarData = useMemo(() => {
    const today = new Date()
    const days: { date: string; count: number; level: number }[] = []

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const session = sessions.find(s => s.date === dateStr)
      const count = session ? session.duration : 0

      let level = 0
      if (count > 0) level = 1
      if (count >= 25) level = 2
      if (count >= 60) level = 3
      if (count >= 120) level = 4

      days.push({ date: dateStr, count, level })
    }

    return days
  }, [sessions])

  const weeks = useMemo(() => {
    const result: typeof calendarData[] = []
    for (let i = 0; i < calendarData.length; i += 7) {
      result.push(calendarData.slice(i, i + 7))
    }
    return result
  }, [calendarData])

  const totalDays = calendarData.filter(d => d.count > 0).length
  const totalMinutes = calendarData.reduce((sum, d) => sum + d.count, 0)
  const avgMinutes = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0

  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = []
    let lastMonth = -1

    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const date = new Date(week[0].date)
        const month = date.getMonth()
        if (month !== lastMonth) {
          labels.push({
            label: date.toLocaleDateString('es-ES', { month: 'short' }),
            weekIndex
          })
          lastMonth = month
        }
      }
    })

    return labels
  }, [weeks])

  const levelColors = [
    'bg-neutral-100',
    'bg-gold/30',
    'bg-gold/50',
    'bg-gold/70',
    'bg-gold'
  ]

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Actividad</h2>
            <p className="text-xs text-neutral-500">
              {totalDays} días activos · {avgMinutes} min/día promedio
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          <div className="flex gap-0.5 mb-2 text-[10px] text-neutral-400">
            <div className="w-8"></div>
            {monthLabels.map((month, i) => (
              <div
                key={i}
                className="absolute"
                style={{ left: `${month.weekIndex * 13}px` }}
              >
                {month.label}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            <div className="flex flex-col gap-0.5 text-[10px] text-neutral-400 pr-1">
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Lun</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Mié</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Vie</div>
              <div className="h-3"></div>
            </div>

            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = week[dayIndex]
                  if (!day) {
                    return <div key={dayIndex} className="h-3 w-3" />
                  }

                  return (
                    <motion.div
                      key={dayIndex}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: weekIndex * 0.001 + dayIndex * 0.0005 }}
                      className={cn(
                        'h-3 w-3 rounded-sm cursor-pointer transition-all hover:scale-125',
                        levelColors[day.level]
                      )}
                      title={`${day.date}: ${day.count} min`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3 text-[10px] text-neutral-400">
            <span>Menos</span>
            {levelColors.map((color, i) => (
              <div key={i} className={cn('h-3 w-3 rounded-sm', color)} />
            ))}
            <span>Más</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
