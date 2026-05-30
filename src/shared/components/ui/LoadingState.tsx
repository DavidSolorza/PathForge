import { cn } from '@shared/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  className?: string
  variant?: 'spinner' | 'skeleton'
}

export function LoadingState({
  message = 'Cargando...',
  className,
  variant = 'spinner',
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4 py-8 px-4', className)}>
        <div className="h-8 w-1/3 rounded-lg bg-neutral-200 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-neutral-200 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-16 rounded bg-neutral-200 animate-pulse" />
                  <div className="h-5 w-12 rounded bg-neutral-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-neutral-200 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 rounded bg-neutral-200 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-neutral-200 animate-pulse" />
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200 animate-pulse" />
            </div>
          ))}
        </div>
        {message && <p className="text-center text-sm text-neutral-400 pt-4">{message}</p>}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
      </div>
      <p className="mt-4 text-sm text-neutral-500 animate-pulse">{message}</p>
    </div>
  )
}
