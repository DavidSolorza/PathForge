import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { StudyService } from '@features/learning-path/services/StudyService'
import { cn } from '@shared/lib/utils'

const FOCUS_MINUTES = 25
const BREAK_MINUTES = 5

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function StudyTimer({ onSessionComplete }: { onSessionComplete?: () => void }) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [timeLeft, setTimeLeft] = useState(FOCUS_MINUTES * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined)

  const totalSeconds = mode === 'focus' ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f3+AgH9/f4B/f3+AgH9/f4B/f3+AgH9/gIB/f3+Af39/gIB/f3+AgH9/gIB/f39/gIB/f3+Af39/gIB/f3+Af3+AgH9/f3+Af3+AgH9/f3+Af3+AgH9/f4B/f3+Af39/gH9/f4B/f3+Af3+AgH9/f4B/f3+AgH9/f4B/f39/gH9/gIB/f3+Af39/gH9/gIB/f3+Af39/gH9/gIB/f3+AgH9/f4B/f3+AgH9/f4B/f3+AgH9/f4B/f3+AgH9/gIB/f3+Af39/gH9/gIB/f3+Af3+AgH9/f4B/f3+Af3+AgH9/f4B/f3+Af39/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gIB/f3+Af39/gIB/f39/gIB/f39/gIB/f39/gIB/f3+Af39/gIB/f39/gIB/f39/gH9/f4B/f3+Af39/gIB/f3+Af39/gIB/f39/gIB/f3+Af39/gIB/f3+Af39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/fHx8fHyAgH9/f3+AgH9/f4B/f3+AgH9/f4B/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gH9/f4B/f3+AgH9/f4B/f39/gH9/f4B/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gH9/f4B/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gH9/f4B/f3+AgH9/f4B/f39/gH9/f4B/f39/gIB/f39/gH9/f4B/f39/gIB/f39/gIB/f39/gH9/f4B/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f3+AgH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gIB/f39/gIB/f39/gH9/f4B/f39/gIB/f39/gH9/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f3+AgH9/f4B/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gH9/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f3+Af3+AgH9/f3+Af39/gH9/f4B/f39/gH9/gIB/f39/gIB/f39/gH9/f4B/f39/gH9/f4B/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gH9/f4B/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f39/gIB/f3+Af39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gH9/f4B/f39/gIA')
    return () => { audioRef.current = undefined }
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            intervalRef.current = undefined
            setRunning(false)
            audioRef.current?.play().catch(() => {})
            if (mode === 'focus') {
              StudyService.checkIn()
              setSessions((s) => s + 1)
              onSessionComplete?.()
              setMode('break')
              setTimeLeft(BREAK_MINUTES * 60)
            } else {
              setMode('focus')
              setTimeLeft(FOCUS_MINUTES * 60)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
    return () => { clearInterval(intervalRef.current) }
  }, [running, mode, onSessionComplete])

  const toggleTimer = useCallback(() => {
    if (timeLeft <= 0) {
      setTimeLeft(mode === 'focus' ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60)
    }
    setRunning((r) => !r)
  }, [mode, timeLeft])

  const resetTimer = useCallback(() => {
    setRunning(false)
    setMode('focus')
    setTimeLeft(FOCUS_MINUTES * 60)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative flex items-center justify-center">
        <svg className="h-20 w-20 -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" className="text-neutral-100" strokeWidth="4" />
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="currentColor"
            className={mode === 'focus' ? 'text-gold transition-all duration-1000 ease-linear' : 'text-green-400 transition-all duration-1000 ease-linear'}
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={cn(
          'absolute text-lg font-bold tabular-nums',
          mode === 'focus' ? 'text-gold-dark' : 'text-green-600'
        )}>
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={cn(
          'text-[10px] font-semibold uppercase tracking-wider',
          mode === 'focus' ? 'text-gold-dark' : 'text-green-600'
        )}>
          {mode === 'focus' ? 'Enfoque' : 'Descanso'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTimer}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 active:scale-90',
            running
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'bg-gold/10 text-gold-dark hover:bg-gold/20'
          )}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          onClick={resetTimer}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-all duration-200 active:scale-90"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      {sessions > 0 && (
        <p className="text-[10px] text-neutral-400">{sessions} sesion{sessions > 1 ? 'es' : ''} completada{sessions > 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
