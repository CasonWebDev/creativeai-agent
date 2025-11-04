'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  value?: number
  label?: string
  showValue?: boolean
}

function Progress({
  className,
  value = 0,
  label,
  showValue = false,
  ...props
}: ProgressProps) {
  const progressValue = Math.min(100, Math.max(0, value))

  // Generate default label if not provided
  const ariaLabel = label || `Progresso: ${progressValue}% completo`

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      value={progressValue}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progressValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      />
      {showValue && (
        <span className="sr-only">
          {progressValue}% completo
        </span>
      )}
    </ProgressPrimitive.Root>
  )
}

export { Progress }
