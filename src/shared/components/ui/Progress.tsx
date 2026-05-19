import { cn } from '@shared/lib/utils'

interface ProgressProps {
  value: number
  className?: string
  barClassName?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function Progress({
  value,
  className,
  barClassName,
  size = 'md',
  showLabel = false,
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex-1 rounded-full bg-neutral-100 overflow-hidden',
          sizes[size],
          className,
        )}
      >
        <div
          className={cn(
            'h-full rounded-full bg-primary-500 transition-all duration-500 ease-out',
            barClassName,
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-neutral-500 min-w-[3ch] tabular-nums">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  )
}
