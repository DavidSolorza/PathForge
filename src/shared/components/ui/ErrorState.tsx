import { cn } from '@shared/lib/utils'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'Ocurrió un error inesperado. Intenta de nuevo.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-red-50 p-4 text-red-400">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={onRetry}
        >
          Reintentar
        </Button>
      )}
    </div>
  )
}
