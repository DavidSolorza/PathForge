import { cn } from '@shared/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({
  message = 'Cargando...',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <p className="mt-3 text-sm text-neutral-500">{message}</p>
    </div>
  )
}
