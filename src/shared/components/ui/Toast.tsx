import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@shared/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastItemProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = icons[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg',
        colors[toast.type],
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="flex-shrink-0 rounded-lg p-0.5 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted || toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
