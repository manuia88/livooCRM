'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
    variant?: 'default' | 'outline' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  illustration?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  size = 'md',
  className = ''
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8 px-4',
    md: 'py-12 px-4',
    lg: 'py-20 px-6'
  }

  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }

  const iconInnerSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]} ${className}`}>
      {/* Icon or Illustration */}
      <div className="mb-4">
        {illustration ? (
          illustration
        ) : Icon ? (
          <div className={`${iconSizes[size]} rounded-full bg-gray-100 flex items-center justify-center`}>
            <Icon className={`${iconInnerSizes[size]} text-gray-400`} />
          </div>
        ) : null}
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-gray-900 mb-2 ${
        size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-base' : 'text-lg'
      }`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`text-gray-500 max-w-md mb-6 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              size={size === 'sm' ? 'sm' : 'default'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
